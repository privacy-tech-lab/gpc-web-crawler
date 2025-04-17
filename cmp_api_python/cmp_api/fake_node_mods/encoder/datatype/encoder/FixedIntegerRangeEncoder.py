#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
from BooleanEncoder import BooleanEncoder
from FixedIntegerEncoder import FixedIntegerEncoder
class FixedIntegerRangeEncoder:
    def decode(bitString):
        for i in bitString:
            if i not in ["0","1"]:
                raise Exception("Undecodable FibonacciIntegerRange '" + bitString + "'")
        value = []
        count = FixedIntegerEncoder.decode(bitString[0:12])
        startIndex = 12
        for i in range(count):
            group = BooleanEncoder.decode(bitString[startIndex:startIndex+1])
            startIndex += 1
            if group == True:
                start = FixedIntegerEncoder.decode(bitString[startIndex:startIndex+16])
                startIndex += 16
                end = FixedIntegerEncoder.decode(bitString[startIndex:startIndex+16])
                startIndex += 16
                for j in range(start, end+1):
                    value.append(j)
            else:
                val = FixedIntegerEncoder.decode(bitString[startIndex:startIndex+16])
                value.append(val)
                startIndex += 16
        return value

# print(FixedIntegerRangeEncoder.decode('00000000001000000000000000011100000000000001010000000000001000'))
# [3, 5, 6, 7, 8]