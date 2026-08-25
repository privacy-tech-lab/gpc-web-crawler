#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableBoolean import EncodableBoolean
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedIntegerList import EncodableFixedIntegerList
from UsFlV1Field import UsFlV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsFlV1(AbstractEncodableSegmentedBitStringSection):
    ID = 13
    VERSION = 1
    NAME = 'usflv1'
    base64UrlEncoder = CompressedBase64UrlEncoder()

    def __init__(self, encodedString=None):
        fields = {}
        # core section
        fields[str(UsFlV1Field["VERSION"])] = EncodableFixedInteger(6, UsFlV1.VERSION)
        fields[str(UsFlV1Field["PROCESSING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsFlV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsFlV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsFlV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsFlV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsFlV1Field["SENSITIVE_DATA_PROCESSING"])] = EncodableFixedIntegerList(2, [0] * 8)
        fields[str(UsFlV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"])] = EncodableFixedIntegerList(2, [0] * 3)
        fields[str(UsFlV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsFlV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsFlV1Field["MSPA_OPT_OUT_OPTION_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsFlV1Field["MSPA_SERVICE_PROVIDER_MODE"])] = EncodableFixedInteger(2, 0)

        coreSegment = [
            str(UsFlV1Field["VERSION"]),
            str(UsFlV1Field["PROCESSING_NOTICE"]),
            str(UsFlV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsFlV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsFlV1Field["SALE_OPT_OUT"]),
            str(UsFlV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsFlV1Field["SENSITIVE_DATA_PROCESSING"]),
            str(UsFlV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"]),
            str(UsFlV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"]),
            str(UsFlV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsFlV1Field["MSPA_OPT_OUT_OPTION_MODE"]),
            str(UsFlV1Field["MSPA_SERVICE_PROVIDER_MODE"]),
        ]

        segments = [coreSegment]

        super().__init__(fields, segments)
        if (encodedString and len(encodedString) > 0):
            self.decode(encodedString)

    def decode(self, encodedSection):
        encodedSegments = encodedSection.split(".")
        segmentBitStrings = [None]
        for i in range(len(encodedSegments)):
            segmentBitStrings[i] = self.base64UrlEncoder.decode(encodedSegments[i])

        self.decodeSegmentsFromBitStrings(segmentBitStrings)
