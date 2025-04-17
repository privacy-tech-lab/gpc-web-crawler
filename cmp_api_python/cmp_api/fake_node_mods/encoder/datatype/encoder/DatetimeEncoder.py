#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
from FixedIntegerEncoder import FixedIntegerEncoder
# from datetime import date
class DatetimeEncoder:
    def decode(bitString):
        if (len(bitString) != 36):
            raise Exception("Undecodable Datetime '" + bitString + "'")
        for i in bitString:
            if i not in ["0","1"]:
                raise Exception("Undecodable FixedInteger '" + bitString + "'")
        # return date.fromtimestamp(FixedIntegerEncoder.decode(bitString) * 100)
        # date.fromtimestamp works differently than Date() in js
        return FixedIntegerEncoder.decode(bitString)*100

    
