#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
import os
path_to_file = str(os.path.dirname(os.path.abspath(__file__)))
path_to_file_list = path_to_file.split('/')
p = '/'.join(path_to_file_list[:-1])

# sys.path.insert(0, str(os.path.dirname(os.path.abspath(__file__)))+'/encoder') 

sys.path.insert(0, p + '/datatype/encoder') 
sys.path.insert(0, p + '/datatype') 
sys.path.insert(0, p + '/field') 
from CompressedBase64UrlEncoder import CompressedBase64UrlEncoder
from EncodableFibonacciIntegerRange import EncodableFibonacciIntegerRange
from EncodableFixedInteger import EncodableFixedInteger
from HeaderV1Field import HeaderV1Field
from AbstractEncodableBitStringSection import AbstractEncodableBitStringSection

class HeaderV1(AbstractEncodableBitStringSection):
    ID = 3
    VERSION = 1
    NAME = 'header'
    base64UrlEncoder = CompressedBase64UrlEncoder()
    def __init__(self, encodedString):
        fields = {
            str(HeaderV1Field["ID"]) : EncodableFixedInteger(6, HeaderV1.ID),
            str(HeaderV1Field["VERSION"]) : EncodableFixedInteger(6, HeaderV1.VERSION),
            str(HeaderV1Field["SECTION_IDS"]) : EncodableFibonacciIntegerRange([])
        }
        fieldOrder = [str(HeaderV1Field["ID"]), str(HeaderV1Field["VERSION"]), str(HeaderV1Field["SECTION_IDS"])]
        # super(fields, fieldOrder)
        super().__init__(fields, fieldOrder)
        if encodedString and len(encodedString) > 0:
            self.decode(encodedString)

    def decode(self, encodedString):
        bitString = HeaderV1.base64UrlEncoder.decode(encodedString)
        self.decodeFromBitString(bitString)
# h = HeaderV1('DBACNY')
# print(h)