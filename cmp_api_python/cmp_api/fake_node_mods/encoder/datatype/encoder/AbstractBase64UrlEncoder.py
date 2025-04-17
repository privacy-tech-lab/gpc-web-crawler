#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
from FixedIntegerEncoder import FixedIntegerEncoder

class AbstractBase64UrlEncoder:
    DICT = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    REVERSE_DICT = {
        'A':0, 'B':1, 'C':2, 'D':3, 'E':4, 'F':5, 'G':6, 'H':7,
        'I':8, 'J':9, 'K':10, 'L':11, 'M':12, 'N':13, 'O':14, 'P':15,
        'Q':16, 'R':17, 'S':18, 'T':19, 'U':20, 'V':21, 'W':22, 'X':23,
        'Y':24, 'Z':25, 'a':26, 'b':27, 'c':28, 'd':29, 'e':30, 'f':31,
        'g':32, 'h':33, 'i':34, 'j':35, 'k':36, 'l':37, 'm':38, 'n':39,
        'o':40, 'p':41, 'q':42, 'r':43, 's':44, 't':45, 'u':46, 'v':47,
        'w':48, 'x':49, 'y':50, 'z':51, '0':52, '1':53, '2':54, '3':55,
        '4':56, '5':57, '6':58, '7':59, '8':60, '9':61, '-':62, '_':63
    }
    def decode(self, str):
        for i in str:
            if i not in AbstractBase64UrlEncoder.DICT:
                raise Exception("Undecodable AbstractBase64UrlEncoder '" + str + "'")
        bitString = ""
        for i in range(len(str)):
            c = str[i]
            n = AbstractBase64UrlEncoder.REVERSE_DICT[c]
            s = FixedIntegerEncoder.encode(n,6)
            bitString += s

        return bitString
        
# print(AbstractBase64UrlEncoder.decode('DBACNY'))
# # '000011 000001 000000 000010 001101 011000'
# print(AbstractBase64UrlEncoder.decode('DBABjw'))
# # '000011 000001 000000 000001 100011 110000'
