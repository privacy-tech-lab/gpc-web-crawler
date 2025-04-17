#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
from BooleanEncoder import BooleanEncoder
class FixedBitfieldEncoder:
    def decode(bitString):
        for i in bitString:
            if i not in ["0","1"]:
                raise Exception("Undecodable FixedBitfield '" + bitString + "'")
        value = []
        for i in range(len(bitString)):
            value.append(BooleanEncoder.decode(bitString[i:i+1]))
        return value
# print(FixedBitfieldEncoder.decode('10100'))