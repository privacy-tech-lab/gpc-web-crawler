#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
class AbstractEncodableSegmentedBitStringSection:
    def __init__(self, fields, segments):
        self.fields = fields
        self.segments = segments
    def decodeSegmentsFromBitStrings(self, segmentBitStrings):
        i = 0
        while i < len(self.segments) and i < len(segmentBitStrings):
            segmentBitString = segmentBitStrings[i]
            if (segmentBitString and len(segmentBitString) > 0):
                index = 0
                for j in range(len(self.segments[i])):
                    fieldName = self.segments[i][j]
                    if fieldName in self.fields:
                        try:
                            field = self.fields[fieldName]
                            substring = field.substring(segmentBitString, index)
                            field.decode(substring)
                            index += len(substring)
                        except:
                            raise Exception("Unable to decode " + fieldName)
                    else:
                        raise Exception("Field not found: '" + fieldName + "'")
            i += 1
    
    def toObj(self):
        obj = {}
        for i in range(len(self.segments)):
            for j in range(len(self.segments[i])):
                fieldName = self.segments[i][j]
                if fieldName in self.fields:
                    field = self.fields[fieldName]
                    value = field.getValue()
                    obj[fieldName] = value
        return obj