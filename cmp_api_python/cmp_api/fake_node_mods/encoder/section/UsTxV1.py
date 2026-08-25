#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableBoolean import EncodableBoolean
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedIntegerList import EncodableFixedIntegerList
from UsTxV1Field import UsTxV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsTxV1(AbstractEncodableSegmentedBitStringSection):
    ID = 16
    VERSION = 1
    NAME = 'ustxv1'
    base64UrlEncoder = CompressedBase64UrlEncoder()

    def __init__(self, encodedString=None):
        fields = {}
        # core section
        fields[str(UsTxV1Field["VERSION"])] = EncodableFixedInteger(6, UsTxV1.VERSION)
        fields[str(UsTxV1Field["PROCESSING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsTxV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsTxV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsTxV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsTxV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsTxV1Field["SENSITIVE_DATA_PROCESSING"])] = EncodableFixedIntegerList(2, [0] * 8)
        fields[str(UsTxV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"])] = EncodableFixedInteger(2, 0)
        fields[str(UsTxV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsTxV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsTxV1Field["MSPA_OPT_OUT_OPTION_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsTxV1Field["MSPA_SERVICE_PROVIDER_MODE"])] = EncodableFixedInteger(2, 0)
        # gpc segment
        fields[str(UsTxV1Field["GPC_SEGMENT_TYPE"])] = EncodableFixedInteger(2, 1)
        fields[str(UsTxV1Field["GPC_SEGMENT_INCLUDED"])] = EncodableBoolean(True)
        fields[str(UsTxV1Field["GPC"])] = EncodableBoolean(False)

        coreSegment = [
            str(UsTxV1Field["VERSION"]),
            str(UsTxV1Field["PROCESSING_NOTICE"]),
            str(UsTxV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsTxV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsTxV1Field["SALE_OPT_OUT"]),
            str(UsTxV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsTxV1Field["SENSITIVE_DATA_PROCESSING"]),
            str(UsTxV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"]),
            str(UsTxV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"]),
            str(UsTxV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsTxV1Field["MSPA_OPT_OUT_OPTION_MODE"]),
            str(UsTxV1Field["MSPA_SERVICE_PROVIDER_MODE"]),
        ]

        gpcSegment = [str(UsTxV1Field["GPC_SEGMENT_TYPE"]), str(UsTxV1Field["GPC"])]
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
        self.fields[UsTxV1Field['GPC_SEGMENT_INCLUDED']].setValue(gpcSegmentIncluded)
