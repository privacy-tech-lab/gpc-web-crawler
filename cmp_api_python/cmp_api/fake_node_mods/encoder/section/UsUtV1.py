#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableBitStringSection import AbstractEncodableBitStringSection
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedIntegerList import EncodableFixedIntegerList
from UsUtV1Field import UsUtV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsUtV1(AbstractEncodableBitStringSection):
    ID = 11
    VERSION = 1
    NAME = "usutv1"
    base64UrlEncoder = CompressedBase64UrlEncoder()
    
    def __init__(self, encodedString):
        fields = {}
        # core section
        fields[str(UsUtV1Field["VERSION"])] = EncodableFixedInteger(6, UsUtV1.VERSION)
        fields[str(UsUtV1Field["SHARING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsUtV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsUtV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsUtV1Field["SENSITIVE_DATA_PROCESSING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsUtV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsUtV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsUtV1Field["SENSITIVE_DATA_PROCESSING"])] = EncodableFixedIntegerList(2, [0, 0, 0, 0, 0, 0, 0, 0])
        fields[str(UsUtV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"])] = EncodableFixedInteger(2, 0)
        fields[str(UsUtV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsUtV1Field["MSPA_OPT_OUT_OPTION_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsUtV1Field["MSPA_SERVICE_PROVIDER_MODE"])] = EncodableFixedInteger(2, 0)
        fieldOrder = [
            str(UsUtV1Field["VERSION"]),
            str(UsUtV1Field["SHARING_NOTICE"]),
            str(UsUtV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsUtV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsUtV1Field["SENSITIVE_DATA_PROCESSING_OPT_OUT_NOTICE"]),
            str(UsUtV1Field["SALE_OPT_OUT"]),
            str(UsUtV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsUtV1Field["SENSITIVE_DATA_PROCESSING"]),
            str(UsUtV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"]),
            str(UsUtV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsUtV1Field["MSPA_OPT_OUT_OPTION_MODE"]),
            str(UsUtV1Field["MSPA_SERVICE_PROVIDER_MODE"]),
        ]
        super().__init__(fields, fieldOrder)
        if (encodedString and len(encodedString) > 0): 
            self.decode(encodedString)

    def decode(self, bitString) :
        self.decodeFromBitString(self.base64UrlEncoder.decode(bitString))
      