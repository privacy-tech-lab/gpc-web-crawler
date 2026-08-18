#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableBoolean import EncodableBoolean
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedIntegerList import EncodableFixedIntegerList
from UsNjV1Field import UsNjV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsNjV1(AbstractEncodableSegmentedBitStringSection):
    ID = 21
    VERSION = 1
    NAME = 'usnjv1'
    base64UrlEncoder = CompressedBase64UrlEncoder()
    
    def __init__(self, encodedString=None):
        fields = {}
        # core section
        fields[str(UsNjV1Field["VERSION"])] = EncodableFixedInteger(6, UsNjV1.VERSION)
        fields[str(UsNjV1Field["PROCESSING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNjV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNjV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNjV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNjV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        
        # New Jersey requires 10 categories for Sensitive Data Processing
        fields[str(UsNjV1Field["SENSITIVE_DATA_PROCESSING"])] = EncodableFixedIntegerList(2, [0] * 10)
        
        # New Jersey requires 5 categories for Known Child Consents
        fields[str(UsNjV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"])] = EncodableFixedIntegerList(2, [0] * 5)
        
        fields[str(UsNjV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNjV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNjV1Field["MSPA_OPT_OUT_OPTION_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNjV1Field["MSPA_SERVICE_PROVIDER_MODE"])] = EncodableFixedInteger(2, 0)
        
        # gpc segment
        fields[str(UsNjV1Field["GPC_SEGMENT_TYPE"])] = EncodableFixedInteger(2, 1)
        fields[str(UsNjV1Field["GPC_SEGMENT_INCLUDED"])] = EncodableBoolean(True)
        fields[str(UsNjV1Field["GPC"])] = EncodableBoolean(False)
        
        coreSegment = [
            str(UsNjV1Field["VERSION"]),
            str(UsNjV1Field["PROCESSING_NOTICE"]),
            str(UsNjV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsNjV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsNjV1Field["SALE_OPT_OUT"]),
            str(UsNjV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsNjV1Field["SENSITIVE_DATA_PROCESSING"]),
            str(UsNjV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"]),
            str(UsNjV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"]),
            str(UsNjV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsNjV1Field["MSPA_OPT_OUT_OPTION_MODE"]),
            str(UsNjV1Field["MSPA_SERVICE_PROVIDER_MODE"]),
        ]
        
        gpcSegment = [str(UsNjV1Field["GPC_SEGMENT_TYPE"]), str(UsNjV1Field["GPC"])]
        segments = [coreSegment, gpcSegment]
        
        super().__init__(fields, segments)
        if (encodedString and len(encodedString) > 0):
            self.decode(encodedString)
   
    def decode(self, encodedSection):
        encodedSegments = encodedSection.split(".")
        segmentBitStrings = [None, None]
        gpcSegmentIncluded = False

        for i in range(len(encodedSegments)):
            segmentBitString = self.base64UrlEncoder.decode(encodedSegments[i])
            match segmentBitString[0:2]:
                case "00": 
                    segmentBitStrings[0] = segmentBitString
                case "01": 
                    gpcSegmentIncluded = True
                    segmentBitStrings[1] = segmentBitString
                case _: 
                    raise Exception("Unable to decode segment '" + encodedSegments[i] + "'")
        
        self.decodeSegmentsFromBitStrings(segmentBitStrings)
        self.fields[UsNjV1Field['GPC_SEGMENT_INCLUDED']].setValue(gpcSegmentIncluded)