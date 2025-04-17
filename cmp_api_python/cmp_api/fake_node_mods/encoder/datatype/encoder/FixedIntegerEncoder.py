#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
class FixedIntegerEncoder:
    # def encode(value, bitStringLength):
    #     bin = []
    #     if value >= 1:
    #         bin.append(1)
    #         while (value >= bin[0] * 2):
    #             bin.insert(0, bin[0] * 2)

    #     bitString = ""
    #     for i in range(len(bin)):
    #         b = bin[i]
    #         if value >= b:
    #             bitString += "1"
    #             value -= b
    #         else:
    #             bitString += "0"
    #     while len(bitString) < bitStringLength:
    #         bitString = "0" + bitString
    #     return bitString
    def encode(value, bitStringLength):
        return format(value, "0"+str(bitStringLength)+"b")
    def decode(bitString):
        if len(bitString) == 0:
            return 0
        else: 
            return int(bitString, 2)
    