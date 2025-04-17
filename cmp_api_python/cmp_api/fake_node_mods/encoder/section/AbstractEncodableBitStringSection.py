#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
class AbstractEncodableBitStringSection:
    def __init__(self, fields, fieldOrder):
        self.fields = fields
        self.fieldOrder = fieldOrder
    def getFieldValue(self, fieldName):
        if fieldName in self.fields:
            return self.fields[fieldName].getValue()
        else:
            return None
    def decodeFromBitString(self, bitString):
        index = 0
        for i in range(len(self.fieldOrder)):
            fieldName = self.fieldOrder[i]
            if fieldName in self.fields:
                field = self.fields[fieldName]
                substring = field.substring(bitString, index)
                field.decode(substring)
                index += len(substring)
            else:
                raise Exception("Field not found: '" + fieldName + "'")
    def toObj(self):
        obj = {}
        for i in range(len(self.fieldOrder)):
            fieldName = self.fieldOrder[i]
            if fieldName in self.fields:
                field = self.fields[fieldName]
                value = field.getValue()
                obj[fieldName] = value
        return obj