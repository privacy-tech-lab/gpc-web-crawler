#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
from FixedIntegerEncoder import FixedIntegerEncoder
class FixedIntegerListEncoder:
    def decode(bitString, elementBitStringLength, numElements):
        for i in bitString:
            if i not in ["0","1"]:
                raise Exception("Undecodable FixedInteger '" + bitString + "'")
        if (len(bitString) > elementBitStringLength * numElements) or (len(bitString) % elementBitStringLength != 0) :
            raise Exception("Undecodable FixedIntegerList '" + bitString + "'")
 
        while (len(bitString) < elementBitStringLength * numElements) :
            bitString += "0"
        
        if (len(bitString) > elementBitStringLength * numElements) :
            bitString = bitString[0: elementBitStringLength * numElements]
        
        value = []
        for i in range(0,len(bitString),elementBitStringLength):
            value.append(FixedIntegerEncoder.decode(bitString[i: i + elementBitStringLength]))
        while (len(value) < numElements) :
            value.append(0)
        
        return value

