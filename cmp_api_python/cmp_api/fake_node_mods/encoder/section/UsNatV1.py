#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableBoolean import EncodableBoolean
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedIntegerList import EncodableFixedIntegerList
from UsNatV1Field import UsNatV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsNatV1(AbstractEncodableSegmentedBitStringSection):
    ID = 7
    VERSION = 1
    NAME = 'usnatv1'
    base64UrlEncoder = CompressedBase64UrlEncoder()

    def __init__(self, encodedString):
        fields = {}
        # core section
        fields[str(UsNatV1Field["VERSION"])] = EncodableFixedInteger(6, UsNatV1.VERSION)
        fields[str(UsNatV1Field["SHARING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["SHARING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["SENSITIVE_DATA_PROCESSING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["SENSITIVE_DATA_LIMIT_USE_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["SHARING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["SENSITIVE_DATA_PROCESSING"])] = EncodableFixedIntegerList(2, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        fields[str(UsNatV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"])] = EncodableFixedIntegerList(2, [0, 0])
        fields[str(UsNatV1Field["PERSONAL_DATA_CONSENTS"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["MSPA_OPT_OUT_OPTION_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNatV1Field["MSPA_SERVICE_PROVIDER_MODE"])] = EncodableFixedInteger(2, 0)
        # gpc segment
        fields[str(UsNatV1Field["GPC_SEGMENT_TYPE"])] = EncodableFixedInteger(2, 1)
        fields[str(UsNatV1Field["GPC_SEGMENT_INCLUDED"])] = EncodableBoolean(True)
        fields[str(UsNatV1Field["GPC"])] = EncodableBoolean(False)
        coreSegment = [
            str(UsNatV1Field["VERSION"]),
            str(UsNatV1Field["SHARING_NOTICE"]),
            str(UsNatV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsNatV1Field["SHARING_OPT_OUT_NOTICE"]),
            str(UsNatV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsNatV1Field["SENSITIVE_DATA_PROCESSING_OPT_OUT_NOTICE"]),
            str(UsNatV1Field["SENSITIVE_DATA_LIMIT_USE_NOTICE"]),
            str(UsNatV1Field["SALE_OPT_OUT"]),
            str(UsNatV1Field["SHARING_OPT_OUT"]),
            str(UsNatV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsNatV1Field["SENSITIVE_DATA_PROCESSING"]),
            str(UsNatV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"]),
            str(UsNatV1Field["PERSONAL_DATA_CONSENTS"]),
            str(UsNatV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsNatV1Field["MSPA_OPT_OUT_OPTION_MODE"]),
            str(UsNatV1Field["MSPA_SERVICE_PROVIDER_MODE"]),
        ]
        gpcSegment = [str(UsNatV1Field["GPC_SEGMENT_TYPE"]), str(UsNatV1Field["GPC"])]
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
        self.fields[UsNatV1Field['GPC_SEGMENT_INCLUDED']].setValue(gpcSegmentIncluded)        