#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableBoolean import EncodableBoolean
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedIntegerList import EncodableFixedIntegerList
from UsNhV1Field import UsNhV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsNhV1(AbstractEncodableSegmentedBitStringSection):
    ID = 20
    VERSION = 1
    NAME = 'usnhv1'
    base64UrlEncoder = CompressedBase64UrlEncoder()

    def __init__(self, encodedString=None):
        fields = {}
        # core section
        fields[str(UsNhV1Field["VERSION"])] = EncodableFixedInteger(6, UsNhV1.VERSION)
        fields[str(UsNhV1Field["PROCESSING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNhV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNhV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNhV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNhV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNhV1Field["SENSITIVE_DATA_PROCESSING"])] = EncodableFixedIntegerList(2, [0] * 8)
        fields[str(UsNhV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"])] = EncodableFixedIntegerList(2, [0] * 3)
        fields[str(UsNhV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNhV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNhV1Field["MSPA_OPT_OUT_OPTION_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsNhV1Field["MSPA_SERVICE_PROVIDER_MODE"])] = EncodableFixedInteger(2, 0)
        # gpc segment
        fields[str(UsNhV1Field["GPC_SEGMENT_TYPE"])] = EncodableFixedInteger(2, 1)
        fields[str(UsNhV1Field["GPC_SEGMENT_INCLUDED"])] = EncodableBoolean(True)
        fields[str(UsNhV1Field["GPC"])] = EncodableBoolean(False)

        coreSegment = [
            str(UsNhV1Field["VERSION"]),
            str(UsNhV1Field["PROCESSING_NOTICE"]),
            str(UsNhV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsNhV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsNhV1Field["SALE_OPT_OUT"]),
            str(UsNhV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsNhV1Field["SENSITIVE_DATA_PROCESSING"]),
            str(UsNhV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"]),
            str(UsNhV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"]),
            str(UsNhV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsNhV1Field["MSPA_OPT_OUT_OPTION_MODE"]),
            str(UsNhV1Field["MSPA_SERVICE_PROVIDER_MODE"]),
        ]

        gpcSegment = [str(UsNhV1Field["GPC_SEGMENT_TYPE"]), str(UsNhV1Field["GPC"])]
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
        self.fields[UsNhV1Field['GPC_SEGMENT_INCLUDED']].setValue(gpcSegmentIncluded)
