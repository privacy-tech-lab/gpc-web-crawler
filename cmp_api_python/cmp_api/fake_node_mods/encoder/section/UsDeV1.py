#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableBoolean import EncodableBoolean
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedIntegerList import EncodableFixedIntegerList
from UsDeV1Field import UsDeV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsDeV1(AbstractEncodableSegmentedBitStringSection):
    ID = 17
    VERSION = 1
    NAME = 'usdev1'
    base64UrlEncoder = CompressedBase64UrlEncoder()

    def __init__(self, encodedString=None):
        fields = {}
        # core section
        fields[str(UsDeV1Field["VERSION"])] = EncodableFixedInteger(6, UsDeV1.VERSION)
        fields[str(UsDeV1Field["PROCESSING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsDeV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsDeV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsDeV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsDeV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsDeV1Field["SENSITIVE_DATA_PROCESSING"])] = EncodableFixedIntegerList(2, [0] * 9)
        fields[str(UsDeV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"])] = EncodableFixedIntegerList(2, [0] * 5)
        fields[str(UsDeV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsDeV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsDeV1Field["MSPA_OPT_OUT_OPTION_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsDeV1Field["MSPA_SERVICE_PROVIDER_MODE"])] = EncodableFixedInteger(2, 0)
        # gpc segment
        fields[str(UsDeV1Field["GPC_SEGMENT_TYPE"])] = EncodableFixedInteger(2, 1)
        fields[str(UsDeV1Field["GPC_SEGMENT_INCLUDED"])] = EncodableBoolean(True)
        fields[str(UsDeV1Field["GPC"])] = EncodableBoolean(False)

        coreSegment = [
            str(UsDeV1Field["VERSION"]),
            str(UsDeV1Field["PROCESSING_NOTICE"]),
            str(UsDeV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsDeV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsDeV1Field["SALE_OPT_OUT"]),
            str(UsDeV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsDeV1Field["SENSITIVE_DATA_PROCESSING"]),
            str(UsDeV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"]),
            str(UsDeV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"]),
            str(UsDeV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsDeV1Field["MSPA_OPT_OUT_OPTION_MODE"]),
            str(UsDeV1Field["MSPA_SERVICE_PROVIDER_MODE"]),
        ]

        gpcSegment = [str(UsDeV1Field["GPC_SEGMENT_TYPE"]), str(UsDeV1Field["GPC"])]
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
        self.fields[UsDeV1Field['GPC_SEGMENT_INCLUDED']].setValue(gpcSegmentIncluded)
