#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
from AbstractBase64UrlEncoder import AbstractBase64UrlEncoder
class CompressedBase64UrlEncoder(AbstractBase64UrlEncoder):
    def  pad(bitString) :
        while (len(bitString) % 8 > 0) :
            bitString += "0"
        
        while (len(bitString) % 6 > 0) :
            bitString += "0"
        
        return bitString
    