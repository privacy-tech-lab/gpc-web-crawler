#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
class FibonacciIntegerEncoder:
    def decode(bitString):
        for i in bitString:
            if i not in ["0","1"]:
                raise Exception("Undecodable FibonacciInteger '" + bitString + "'")
        if len(bitString) < 2 :#or bitString.indexOf("11") != len(bitString) - 2):
            raise Exception("Undecodable FibonacciInteger '" + bitString + "'")
 
        fibonacci = [1,2]
        while len(fibonacci) < len(bitString):
            fibonacci.append(fibonacci[-1] + fibonacci[-2])
        
        total = 0
        for i in range(len(bitString)-1): # want to exclude last digit b/c you ignore it for decoding
            if bitString[i] == '1':
                total += fibonacci[i]
        
        return total    
