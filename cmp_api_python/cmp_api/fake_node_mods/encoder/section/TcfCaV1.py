#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 
import datetime

from EncodableBoolean import  EncodableBoolean
from EncodableDatetime import EncodableDatetime 
from EncodableFlexibleBitfield import EncodableFlexibleBitfield
from EncodableFixedBitfield import EncodableFixedBitfield
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedString import EncodableFixedString
from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableOptimizedFixedRange import EncodableOptimizedFixedRange
from TcfCaV1Field import TcfCaV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder
class TcfCaV1(AbstractEncodableSegmentedBitStringSection):
    ID = 5
    VERSION = 2
    NAME = "tcfcav1"
    base64UrlEncoder = CompressedBase64UrlEncoder()
    def __init__(self, encodedString):
        fields = {}
        date = datetime.datetime.now()
        # // core section
        fields[str(TcfCaV1Field["VERSION"])] = EncodableFixedInteger(6, TcfCaV1.VERSION)
        fields[str(TcfCaV1Field["CREATED"])] = EncodableDatetime(date)
        fields[str(TcfCaV1Field["LAST_UPDATED"])] = EncodableDatetime(date)
        fields[str(TcfCaV1Field["CMP_ID"])] = EncodableFixedInteger(12, 0)
        fields[str(TcfCaV1Field["CMP_VERSION"])] = EncodableFixedInteger(12, 0)
        fields[str(TcfCaV1Field["CONSENT_SCREEN"])] = EncodableFixedInteger(6, 0)
        fields[str(TcfCaV1Field["CONSENT_LANGUAGE"])] = EncodableFixedString(2, "EN")
        fields[str(TcfCaV1Field["VENDOR_LIST_VERSION"])] = EncodableFixedInteger(12, 0)
        fields[str(TcfCaV1Field["TCF_POLICY_VERSION"])] = EncodableFixedInteger(6, 1)
        fields[str(TcfCaV1Field["USE_NON_STANDARD_STACKS"])] = EncodableBoolean(False)
        fields[str(TcfCaV1Field["SPECIAL_FEATURE_EXPRESS_CONSENT"])] = EncodableFixedBitfield([False, False, False, False, False, False, False, False, False, False, False, False])
        fields[str(TcfCaV1Field["PURPOSES_EXPRESS_CONSENT"])] = EncodableFixedBitfield([
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
        ])
        fields[str(TcfCaV1Field["PURPOSES_IMPLIED_CONSENT"])] = EncodableFixedBitfield([
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
        ])
        fields[str(TcfCaV1Field["VENDOR_EXPRESS_CONSENT"])] = EncodableOptimizedFixedRange([])
        fields[str(TcfCaV1Field["VENDOR_IMPLIED_CONSENT"])] = EncodableOptimizedFixedRange([])
        # // publisher purposes segment
        fields[str(TcfCaV1Field["SEGMENT_TYPE"])] = EncodableFixedInteger(3, 3)
        fields[str(TcfCaV1Field["PUB_PURPOSES_EXPRESS_CONSENT"])] = EncodableFixedBitfield([
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
        ])
        fields[str(TcfCaV1Field["PUB_PURPOSES_IMPLIED_CONSENT"])] = EncodableFixedBitfield([
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
        ])
        numCustomPurposes = EncodableFixedInteger(6, 0)
        fields[str(TcfCaV1Field["NUM_CUSTOM_PURPOSES"])]= numCustomPurposes
        fields[str(TcfCaV1Field["CUSTOM_PURPOSES_EXPRESS_CONSENT"])] = EncodableFlexibleBitfield( numCustomPurposes.getValue(), [])
        fields[str(TcfCaV1Field["CUSTOM_PURPOSES_IMPLIED_CONSENT"])] = EncodableFlexibleBitfield( numCustomPurposes.getValue(), [])
        coreSegment = [
            str(TcfCaV1Field["VERSION"]),
            str(TcfCaV1Field["CREATED"]),
            str(TcfCaV1Field["LAST_UPDATED"]),
            str(TcfCaV1Field["CMP_ID"]),
            str(TcfCaV1Field["CMP_VERSION"]),
            str(TcfCaV1Field["CONSENT_SCREEN"]),
            str(TcfCaV1Field["CONSENT_LANGUAGE"]),
            str(TcfCaV1Field["VENDOR_LIST_VERSION"]),
            str(TcfCaV1Field["TCF_POLICY_VERSION"]),
            str(TcfCaV1Field["USE_NON_STANDARD_STACKS"]),
            str(TcfCaV1Field["SPECIAL_FEATURE_EXPRESS_CONSENT"]),
            str(TcfCaV1Field["PURPOSES_EXPRESS_CONSENT"]),
            str(TcfCaV1Field["PURPOSES_IMPLIED_CONSENT"]),
            str(TcfCaV1Field["VENDOR_EXPRESS_CONSENT"]),
            str(TcfCaV1Field["VENDOR_IMPLIED_CONSENT"]),
        ]
        publisherPurposesSegment = [
            str(TcfCaV1Field["SEGMENT_TYPE"]),
            str(TcfCaV1Field["PUB_PURPOSES_EXPRESS_CONSENT"]),
            str(TcfCaV1Field["PUB_PURPOSES_IMPLIED_CONSENT"]),
            str(TcfCaV1Field["NUM_CUSTOM_PURPOSES"]),
            str(TcfCaV1Field["CUSTOM_PURPOSES_EXPRESS_CONSENT"]),
            str(TcfCaV1Field["CUSTOM_PURPOSES_IMPLIED_CONSENT"]),
        ]
        segments = [coreSegment, publisherPurposesSegment]
        super().__init__(fields, segments)
        # super(fields, segments)
        if (encodedString and len(encodedString) > 0) :
            self.decode(encodedString)
        
    def decode(self, encodedSection):
        encodedSegments = encodedSection.split(".")
        segmentBitStrings = [None, None]
        for i in range(len(encodedSegments)):
            segmentBitString = self.base64UrlEncoder.decode(encodedSegments[i])
            match segmentBitString[0:3]:

                case "000":
                    segmentBitStrings[0] = segmentBitString
                case "011":
                    segmentBitStrings[1] = segmentBitString
                case _:
                    raise Exception("Unable to decode segment '" + encodedSegments[i] + "'")
        self.decodeSegmentsFromBitStrings(segmentBitStrings)


            
# print(TcfCaV1('BPxoFsAPxoFsAPoABABGCyCAAAAAAAAAAAAAAAAA.YAAAAAAAAAA').fields)