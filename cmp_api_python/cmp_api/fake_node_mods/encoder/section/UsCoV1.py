#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableBoolean import EncodableBoolean
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedIntegerList import EncodableFixedIntegerList
from UsCoV1Field import UsCoV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsCoV1(AbstractEncodableSegmentedBitStringSection):
    ID = 10
    VERSION = 1
    NAME = "uscov1"
    base64UrlEncoder = CompressedBase64UrlEncoder()
    def __init__(self, encodedString):
        fields = {}
        # core section
        fields[str(UsCoV1Field["VERSION"])] = EncodableFixedInteger(6, UsCoV1.VERSION)
        fields[str(UsCoV1Field["SHARING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsCoV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsCoV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsCoV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsCoV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsCoV1Field["SENSITIVE_DATA_PROCESSING"])] = EncodableFixedIntegerList(2, [0, 0, 0, 0, 0, 0, 0])
        fields[str(UsCoV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"])] = EncodableFixedInteger(2, 0)
        fields[str(UsCoV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsCoV1Field["MSPA_OPT_OUT_OPTION_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsCoV1Field["MSPA_SERVICE_PROVIDER_MODE"])] = EncodableFixedInteger(2, 0)
        # gpc segment
        fields[str(UsCoV1Field["GPC_SEGMENT_TYPE"])] = EncodableFixedInteger(2, 1)
        fields[str(UsCoV1Field["GPC_SEGMENT_INCLUDED"])] = EncodableBoolean(True)
        fields[str(UsCoV1Field["GPC"])] = EncodableBoolean(False)
        coreSegment = [
            str(UsCoV1Field["VERSION"]),
            str(UsCoV1Field["SHARING_NOTICE"]),
            str(UsCoV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsCoV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsCoV1Field["SALE_OPT_OUT"]),
            str(UsCoV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsCoV1Field["SENSITIVE_DATA_PROCESSING"]),
            str(UsCoV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"]),
            str(UsCoV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsCoV1Field["MSPA_OPT_OUT_OPTION_MODE"]),
            str(UsCoV1Field["MSPA_SERVICE_PROVIDER_MODE"]),
        ]
        gpcSegment = [str(UsCoV1Field["GPC_SEGMENT_TYPE"]), str(UsCoV1Field["GPC"])]
        segments = [coreSegment, gpcSegment]
        super().__init__(fields, segments)
        if (encodedString and len(encodedString) > 0) :
            self.decode(encodedString)
        
    
    def decode(self, encodedSection) :
        encodedSegments = encodedSection.split(".")
        segmentBitStrings = [None, None]
        gpcSegmentIncluded = False

        for i in range(len(encodedSegments)):
            #      * first char will contain 6 bits, we only need the first 2.
            #      * There is no segment type for the CORE string. Instead the first 6 bits are reserved for the
            #      * encoding version, but because we're only on a maximum of encoding version 2 the first 2 bits in
            #      * the core segment will evaluate to 0.
            #      */
            segmentBitString = self.base64UrlEncoder.decode(encodedSegments[i])
            match segmentBitString[0:2]:
                # // unfortunately, the segment ordering doesn't match the segment ids
                case "00": 
                    segmentBitStrings[0] = segmentBitString
                     

                case "01": 
                    gpcSegmentIncluded = True
                    segmentBitStrings[1] = segmentBitString
            
               
                case _: 
                    raise Exception("Unable to decode segment '" + encodedSegments[i] + "'")
        
        self.decodeSegmentsFromBitStrings(segmentBitStrings)
        self.fields[UsCoV1Field['GPC_SEGMENT_INCLUDED']].setValue(gpcSegmentIncluded)