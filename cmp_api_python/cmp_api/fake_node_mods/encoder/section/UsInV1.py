#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableBoolean import EncodableBoolean
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedIntegerList import EncodableFixedIntegerList
from UsInV1Field import UsInV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsInV1(AbstractEncodableSegmentedBitStringSection):
    ID = 25
    VERSION = 1
    NAME = 'usinv1'
    base64UrlEncoder = CompressedBase64UrlEncoder()

    def __init__(self, encodedString=None):
        fields = {}
        # core section
        fields[str(UsInV1Field["MSPA_VERSION"])] = EncodableFixedInteger(6, UsInV1.VERSION)
        fields[str(UsInV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsInV1Field["MSPA_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsInV1Field["PROCESSING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsInV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsInV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsInV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsInV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsInV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"])] = EncodableFixedInteger(2, 0)
        fields[str(UsInV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"])] = EncodableFixedInteger(2, 0)
        # sensitive data consent segment
        fields[str(UsInV1Field["SENSITIVE_DATA_CONSENT_SEGMENT_INCLUDED"])] = EncodableBoolean(False)
        fields[str(UsInV1Field["SENSITIVE_DATA_PROCESSING"])] = EncodableFixedIntegerList(2, [0] * 8)

        coreSegment = [
            str(UsInV1Field["MSPA_VERSION"]),
            str(UsInV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsInV1Field["MSPA_MODE"]),
            str(UsInV1Field["PROCESSING_NOTICE"]),
            str(UsInV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsInV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsInV1Field["SALE_OPT_OUT"]),
            str(UsInV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsInV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"]),
            str(UsInV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"]),
        ]

        sensitiveDataSegment = [
            str(UsInV1Field["SENSITIVE_DATA_CONSENT_SEGMENT_INCLUDED"]),
            str(UsInV1Field["SENSITIVE_DATA_PROCESSING"]),
        ]
        segments = [coreSegment, sensitiveDataSegment]

        super().__init__(fields, segments)
        if (encodedString and len(encodedString) > 0):
            self.decode(encodedString)

    def decode(self, encodedSection):
        encodedSegments = encodedSection.split(".")
        segmentBitStrings = [None, None]
        sensitiveDataConsentSegmentIncluded = False

        # unlike the GPC-style states, this state's optional second segment
        # carries no leading SegmentType marker -- it's identified purely by
        # whether a second '.'-delimited chunk is present.
        for i in range(len(encodedSegments)):
            segmentBitStrings[i] = self.base64UrlEncoder.decode(encodedSegments[i])
        if len(encodedSegments) > 1:
            sensitiveDataConsentSegmentIncluded = True

        self.decodeSegmentsFromBitStrings(segmentBitStrings)
        self.fields[UsInV1Field['SENSITIVE_DATA_CONSENT_SEGMENT_INCLUDED']].setValue(sensitiveDataConsentSegmentIncluded)
