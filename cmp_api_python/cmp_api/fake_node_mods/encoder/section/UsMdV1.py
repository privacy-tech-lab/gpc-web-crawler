#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableBoolean import EncodableBoolean
from EncodableFixedInteger import EncodableFixedInteger
from UsMdV1Field import UsMdV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsMdV1(AbstractEncodableSegmentedBitStringSection):
    ID = 24
    VERSION = 1
    NAME = 'usmdv1'
    base64UrlEncoder = CompressedBase64UrlEncoder()

    def __init__(self, encodedString=None):
        fields = {}
        # core section
        fields[str(UsMdV1Field["MSPA_Version"])] = EncodableFixedInteger(6, UsMdV1.VERSION)
        fields[str(UsMdV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsMdV1Field["MSPA_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsMdV1Field["PROCESSING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsMdV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsMdV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsMdV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsMdV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsMdV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"])] = EncodableFixedInteger(2, 0)
        # gpc segment
        fields[str(UsMdV1Field["GPC_SEGMENT_TYPE"])] = EncodableFixedInteger(2, 1)
        fields[str(UsMdV1Field["GPC_SEGMENT_INCLUDED"])] = EncodableBoolean(True)
        fields[str(UsMdV1Field["GPC"])] = EncodableBoolean(False)

        coreSegment = [
            str(UsMdV1Field["MSPA_Version"]),
            str(UsMdV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsMdV1Field["MSPA_MODE"]),
            str(UsMdV1Field["PROCESSING_NOTICE"]),
            str(UsMdV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsMdV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsMdV1Field["SALE_OPT_OUT"]),
            str(UsMdV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsMdV1Field["ADDITIONAL_DATA_PROCESSING_CONSENT"]),
        ]

        gpcSegment = [str(UsMdV1Field["GPC_SEGMENT_TYPE"]), str(UsMdV1Field["GPC"])]
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
        self.fields[UsMdV1Field['GPC_SEGMENT_INCLUDED']].setValue(gpcSegmentIncluded)
