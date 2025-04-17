#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../datatype/encoder') 
sys.path.insert(0, '../datatype') 
sys.path.insert(0, '../field') 

from AbstractEncodableBitStringSection import AbstractEncodableBitStringSection
from EncodableFixedInteger import EncodableFixedInteger
from EncodableFixedIntegerList import EncodableFixedIntegerList
from UsVaV1Field import UsVaV1Field
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder

class UsVaV1(AbstractEncodableBitStringSection):
    ID = 9
    VERSION = 1
    NAME = "usvav1"
    base64UrlEncoder = CompressedBase64UrlEncoder()

    def __init__(self, encodedString):
        fields = {}
        # core section
        fields[str(UsVaV1Field["VERSION"])] = EncodableFixedInteger(6, UsVaV1.VERSION)
        fields[str(UsVaV1Field["SHARING_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsVaV1Field["SALE_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsVaV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsVaV1Field["SALE_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsVaV1Field["TARGETED_ADVERTISING_OPT_OUT"])] = EncodableFixedInteger(2, 0)
        fields[str(UsVaV1Field["SENSITIVE_DATA_PROCESSING"])] = EncodableFixedIntegerList(2, [0, 0, 0, 0, 0, 0, 0, 0])
        fields[str(UsVaV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"])] = EncodableFixedInteger(2, 0)
        fields[str(UsVaV1Field["MSPA_COVERED_TRANSACTION"])] = EncodableFixedInteger(2, 0)
        fields[str(UsVaV1Field["MSPA_OPT_OUT_OPTION_MODE"])] = EncodableFixedInteger(2, 0)
        fields[str(UsVaV1Field["MSPA_SERVICE_PROVIDER_MODE"])] = EncodableFixedInteger(2, 0)
        fieldOrder = [
            str(UsVaV1Field["VERSION"]),
            str(UsVaV1Field["SHARING_NOTICE"]),
            str(UsVaV1Field["SALE_OPT_OUT_NOTICE"]),
            str(UsVaV1Field["TARGETED_ADVERTISING_OPT_OUT_NOTICE"]),
            str(UsVaV1Field["SALE_OPT_OUT"]),
            str(UsVaV1Field["TARGETED_ADVERTISING_OPT_OUT"]),
            str(UsVaV1Field["SENSITIVE_DATA_PROCESSING"]),
            str(UsVaV1Field["KNOWN_CHILD_SENSITIVE_DATA_CONSENTS"]),
            str(UsVaV1Field["MSPA_COVERED_TRANSACTION"]),
            str(UsVaV1Field["MSPA_OPT_OUT_OPTION_MODE"]),
            str(UsVaV1Field["MSPA_SERVICE_PROVIDER_MODE"]),
        ]
        super().__init__(fields, fieldOrder)
        if (encodedString and len(encodedString) > 0): 
            self.decode(encodedString)
        
    def decode(self, bitString) :
        self.decodeFromBitString(self.base64UrlEncoder.decode(bitString))