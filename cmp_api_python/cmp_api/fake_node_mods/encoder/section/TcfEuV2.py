#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 
import datetime

from EncodableBoolean import EncodableBoolean
from EncodableDatetime import EncodableDatetime
from EncodableFlexibleBitfield import EncodableFlexibleBitfield
from EncodableFixedBitfield import EncodableFixedBitfield
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedString import EncodableFixedString
from AbstractEncodableSegmentedBitStringSection import AbstractEncodableSegmentedBitStringSection
from EncodableFixedIntegerRange import EncodableFixedIntegerRange 
from EncodableOptimizedFixedRange import EncodableOptimizedFixedRange
from TcfEuV2Field import TcfEuV2Field
from TraditionalBase64UrlEncoder import TraditionalBase64UrlEncoder

class TcfEuV2(AbstractEncodableSegmentedBitStringSection):
    ID = 2
    VERSION = 2
    NAME = "tcfeuv2"
    base64UrlEncoder = TraditionalBase64UrlEncoder()
    def __init__(self, encodedString):
        
        fields = {}
        date = datetime.datetime.now()
        # core section
        fields[str(TcfEuV2Field["VERSION"])] = EncodableFixedInteger(6, TcfEuV2.VERSION) 
        fields[str(TcfEuV2Field["CREATED"])] = EncodableDatetime(date) 
        fields[str(TcfEuV2Field["LAST_UPDATED"])] = EncodableDatetime(date) 
        fields[str(TcfEuV2Field["CMP_ID"])] = EncodableFixedInteger(12, 0) 
        fields[str(TcfEuV2Field["CMP_VERSION"])] = EncodableFixedInteger(12, 0) 
        fields[str(TcfEuV2Field["CONSENT_SCREEN"])] = EncodableFixedInteger(6, 0) 
        fields[str(TcfEuV2Field["CONSENT_LANGUAGE"])] = EncodableFixedString(2, "EN") 
        fields[str(TcfEuV2Field["VENDOR_LIST_VERSION"])] = EncodableFixedInteger(12, 0) 
        fields[str(TcfEuV2Field["POLICY_VERSION"])] = EncodableFixedInteger(6, 2) 
        fields[str(TcfEuV2Field["IS_SERVICE_SPECIFIC"])] = EncodableBoolean(False) 
        fields[str(TcfEuV2Field["USE_NON_STANDARD_STACKS"])] = EncodableBoolean(False) 
        fields[str(TcfEuV2Field["SPECIAL_FEATURE_OPTINS"])] = EncodableFixedBitfield([False, False, False, False, False, False, False, False, False, False, False, False]) 
        fields[str(TcfEuV2Field["PURPOSE_CONSENTS"])] = EncodableFixedBitfield([
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
        fields[str(TcfEuV2Field["PURPOSE_LEGITIMATE_INTERESTS"])] = EncodableFixedBitfield([
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
        fields[str(TcfEuV2Field["PURPOSE_ONE_TREATMENT"])] = EncodableBoolean(False) 
        fields[str(TcfEuV2Field["PUBLISHER_COUNTRY_CODE"])] = EncodableFixedString(2, "AA") 
        fields[str(TcfEuV2Field["VENDOR_CONSENTS"])] = EncodableOptimizedFixedRange([]) 
        fields[str(TcfEuV2Field["VENDOR_LEGITIMATE_INTERESTS"])] = EncodableOptimizedFixedRange([]) 
        fields[str(TcfEuV2Field["PUBLISHER_RESTRICTIONS"])] = EncodableFixedIntegerRange([]) 
        # publisher purposes segment
        fields[str(TcfEuV2Field["PUBLISHER_PURPOSES_SEGMENT_TYPE"])] = EncodableFixedInteger(3, 3) 
        fields[str(TcfEuV2Field["PUBLISHER_CONSENTS"])] = EncodableFixedBitfield([
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
        fields[str(TcfEuV2Field["PUBLISHER_LEGITIMATE_INTERESTS"])] = EncodableFixedBitfield([
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
        fields[str(TcfEuV2Field["NUM_CUSTOM_PURPOSES"])] = numCustomPurposes
        fields[str(TcfEuV2Field["PUBLISHER_CUSTOM_CONSENTS"])] = EncodableFlexibleBitfield(numCustomPurposes.getValue(), [])
        fields[str(TcfEuV2Field["PUBLISHER_CUSTOM_LEGITIMATE_INTERESTS"])] = EncodableFlexibleBitfield(numCustomPurposes.getValue(), [])
        fields[str(TcfEuV2Field["VENDORS_ALLOWED_SEGMENT_TYPE"])] = EncodableFixedInteger(3, 2) 
        fields[str(TcfEuV2Field["VENDORS_ALLOWED"])] = EncodableOptimizedFixedRange([]) 
        fields[str(TcfEuV2Field["VENDORS_DISCLOSED_SEGMENT_TYPE"])] = EncodableFixedInteger(3, 1) 
        fields[str(TcfEuV2Field["VENDORS_DISCLOSED"])] = EncodableOptimizedFixedRange([]) 
        coreSegment = [
            str(TcfEuV2Field["VERSION"]),
            str(TcfEuV2Field["CREATED"]),
            str(TcfEuV2Field["LAST_UPDATED"]),
            str(TcfEuV2Field["CMP_ID"]),
            str(TcfEuV2Field["CMP_VERSION"]),
            str(TcfEuV2Field["CONSENT_SCREEN"]),
            str(TcfEuV2Field["CONSENT_LANGUAGE"]),
            str(TcfEuV2Field["VENDOR_LIST_VERSION"]),
            str(TcfEuV2Field["POLICY_VERSION"]),
            str(TcfEuV2Field["IS_SERVICE_SPECIFIC"]),
            str(TcfEuV2Field["USE_NON_STANDARD_STACKS"]),
            str(TcfEuV2Field["SPECIAL_FEATURE_OPTINS"]),
            str(TcfEuV2Field["PURPOSE_CONSENTS"]),
            str(TcfEuV2Field["PURPOSE_LEGITIMATE_INTERESTS"]),
            str(TcfEuV2Field["PURPOSE_ONE_TREATMENT"]),
            str(TcfEuV2Field["PUBLISHER_COUNTRY_CODE"]),
            str(TcfEuV2Field["VENDOR_CONSENTS"]),
            str(TcfEuV2Field["VENDOR_LEGITIMATE_INTERESTS"]),
            str(TcfEuV2Field["PUBLISHER_RESTRICTIONS"]),
        ]
        publisherPurposesSegment = [
            str(TcfEuV2Field["PUBLISHER_PURPOSES_SEGMENT_TYPE"]),
            str(TcfEuV2Field["PUBLISHER_CONSENTS"]),
            str(TcfEuV2Field["PUBLISHER_LEGITIMATE_INTERESTS"]),
            str(TcfEuV2Field["NUM_CUSTOM_PURPOSES"]),
            str(TcfEuV2Field["PUBLISHER_CUSTOM_CONSENTS"]),
            str(TcfEuV2Field["PUBLISHER_CUSTOM_LEGITIMATE_INTERESTS"]),
        ]
        vendorsAllowedSegment = [
            str(TcfEuV2Field["VENDORS_ALLOWED_SEGMENT_TYPE"]),
            str(TcfEuV2Field["VENDORS_ALLOWED"]),
        ]
        vendorsDisclosedSegment = [
            str(TcfEuV2Field["VENDORS_DISCLOSED_SEGMENT_TYPE"]),
            str(TcfEuV2Field["VENDORS_DISCLOSED"]),
        ]
        segments = [coreSegment, publisherPurposesSegment, vendorsAllowedSegment, vendorsDisclosedSegment]
        super().__init__(fields, segments)
        if (encodedString and len(encodedString) > 0) :
            self.decode(encodedString)
        
    def decode(self, encodedSection) :
        encodedSegments = encodedSection.split(".")
        segmentBitStrings = [None, None, None, None]
        for i in range(len(encodedSegments)):
            # /**
            #  * first char will contain 6 bits, we only need the first 3. In version 1
            #  * and 2 of the TC string there is no segment type for the CORE string.
            #  * Instead the first 6 bits are reserved for the encoding version, but
            #  * because we're only on a maximum of encoding version 2 the first 3 bits
            #  * in the core segment will evaluate to 0.
            #  */
            segmentBitString = self.base64UrlEncoder.decode(encodedSegments[i])
            match segmentBitString[0:3]:
                # // unfortunately, the segment ordering doesn't match the segment ids
                case "000": 
                    segmentBitStrings[0] = segmentBitString
                     
                case "001": 
                    segmentBitStrings[3] = segmentBitString
                 
                case "010": 
                    segmentBitStrings[2] = segmentBitString
             
                case "011": 
                    segmentBitStrings[1] = segmentBitString
           
                case _: 
                    raise Exception("Unable to decode segment '" + encodedSegments[i] + "'")
        
        self.decodeSegmentsFromBitStrings(segmentBitStrings)
    

