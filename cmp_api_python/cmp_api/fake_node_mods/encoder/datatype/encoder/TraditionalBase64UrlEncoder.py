#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
from AbstractBase64UrlEncoder import AbstractBase64UrlEncoder
class TraditionalBase64UrlEncoder(AbstractBase64UrlEncoder):
    def pad(self, bitString) :
        while (len(bitString) % 24 > 0) :
            bitString += "0"
        
        return bitString
