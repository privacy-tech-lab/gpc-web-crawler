#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
class AbstractEncodableBitStringDataType:
    def getValue(self):
        return self.value
    def setValue(self,value):
        self.value = value
# instance = AbstractEncodableBitStringDataType()  
# print(instance.setValue(1)) # None
# print(instance.getValue()) # 1