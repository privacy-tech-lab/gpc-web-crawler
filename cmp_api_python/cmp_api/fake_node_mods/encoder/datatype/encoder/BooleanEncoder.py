#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
class BooleanEncoder:
    def decode(bitString):
        if (bitString == "1") :
            return True
        elif (bitString == "0") :
            return False
        else :
            raise Exception("Undecodable Boolean '" + bitString + "'")
        
    