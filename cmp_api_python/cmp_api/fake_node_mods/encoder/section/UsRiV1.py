#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableBoolean import EncodableBoolean
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedIntegerList import EncodableFixedIntegerList
from UsRiV1Field import UsRiV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsRiV1(AbstractEncodableSegmentedBitStringSection):
    ID = 27
    VERSION = 1
    NAME = 'usriv1'
    base64UrlEncoder = CompressedBase64UrlEncoder()

    def __init__(self, encodedString=None):
        fields = {}
        # core section
        fields[str(UsRiV1Field["MSPA_VERSION"])] = EncodableFixedInteger(6, UsRiV1.VERSION)
        fields[str(UsRiV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsRiV1Field["MSPA_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsRiV1Field["PROCESSING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsRiV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsRiV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsRiV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsRiV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsRiV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"])] = EncodableFixedInteger(2, 0)
        fields[str(UsRiV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"])] = EncodableFixedInteger(2, 0)
        # sensitive data consent segment
        fields[str(UsRiV1Field["SENSITIVE_DATA_CONSENT_SEGMENT_INCLUDED"])] = EncodableBoolean(False)
        fields[str(UsRiV1Field["SENSITIVE_DATA_PROCESSING"])] = EncodableFixedIntegerList(2, [0] * 8)

        coreSegment = [
            str(UsRiV1Field["MSPA_VERSION"]),
            str(UsRiV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsRiV1Field["MSPA_MODE"]),
            str(UsRiV1Field["PROCESSING_NOTICE"]),
            str(UsRiV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsRiV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsRiV1Field["SALE_OPT_OUT"]),
            str(UsRiV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsRiV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"]),
            str(UsRiV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"]),
        ]

        sensitiveDataSegment = [
            str(UsRiV1Field["SENSITIVE_DATA_CONSENT_SEGMENT_INCLUDED"]),
            str(UsRiV1Field["SENSITIVE_DATA_PROCESSING"]),
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
        self.fields[UsRiV1Field['SENSITIVE_DATA_CONSENT_SEGMENT_INCLUDED']].setValue(sensitiveDataConsentSegmentIncluded)
