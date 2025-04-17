#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
from FixedIntegerEncoder import FixedIntegerEncoder
class FixedStringEncoder:
    def decode(bitString):
        for i in bitString:
            if i not in ["0","1"]:
                raise Exception("Undecodable FibonacciIntegerRange '" + bitString + "'")
        value = ""
        for i in range(0, len(bitString), 6):
            code = FixedIntegerEncoder.decode(bitString[i:i+6])
            if code == 63:
                value += " "
            else:
                value += chr(code + 65)
        return value.strip()

# print(FixedStringEncoder.decode('000011000001000000000001100011110000'))
# print(FixedStringEncoder.decode('000011000001000000000010001101011000'))
# print(FixedStringEncoder.decode('000011000001000000000001001100'))