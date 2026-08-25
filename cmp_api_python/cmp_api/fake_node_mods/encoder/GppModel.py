#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
import os
sys.path.insert(0, str(os.path.dirname(os.path.abspath(__file__)))+'/section') 

from HeaderV1 import HeaderV1
from Sections import Sections
from TcfCaV1 import TcfCaV1
from TcfEuV2 import TcfEuV2
from UspV1 import UspV1
from UsNatV1 import UsNatV1
from UsCaV1 import UsCaV1
from UsVaV1 import UsVaV1
from UsCoV1 import UsCoV1
from UsUtV1 import UsUtV1
from UsCtV1 import UsCtV1
from UsNjV1 import UsNjV1
from UsFlV1 import UsFlV1
from UsMtV1 import UsMtV1
from UsOrV1 import UsOrV1
from UsTxV1 import UsTxV1
from UsDeV1 import UsDeV1
from UsIaV1 import UsIaV1
from UsNeV1 import UsNeV1
from UsNhV1 import UsNhV1
from UsTnV1 import UsTnV1
from UsMnV1 import UsMnV1
from UsMdV1 import UsMdV1
from UsInV1 import UsInV1
from UsKyV1 import UsKyV1
from UsRiV1 import UsRiV1


class GppModel:
    sections = {}
    def __init__(self, encodedString):
        if encodedString:
            self.encodedString = encodedString
            self.decoded = False
            self.dirty = False
        else:
            self.encodedString = "DBAA"
            self.decoded = False
            self.dirty = False

    def decode(self, str):
        self.encodedString = str
        self.decoded = False
        self.dirty = True
        self.sections.clear()
        encodedSections = str.split("~")
        header = HeaderV1(encodedSections[0])
        self.sections[HeaderV1.NAME] = header
        sectionIds = header.getFieldValue("SectionIds")
        for i in range(len(sectionIds)):
            if (sectionIds[i] == TcfCaV1.ID) :
                section = TcfCaV1(encodedSections[i + 1])
                self.sections[TcfCaV1.NAME] = section
                # print('skipping TcfCaV1')
            elif (sectionIds[i] == TcfEuV2.ID) :
                section = TcfEuV2(encodedSections[i + 1])
                self.sections[TcfEuV2.NAME] = section
                # print('skipping TcfEuV2')
            elif (sectionIds[i] == UspV1.ID) :
                section = UspV1(encodedSections[i + 1])
                self.sections[UspV1.NAME] = section
            elif (sectionIds[i] == UsNatV1.ID) :
                section = UsNatV1(encodedSections[i + 1])
                self.sections[UsNatV1.NAME] = section
            elif (sectionIds[i] == UsCaV1.ID) :
                section = UsCaV1(encodedSections[i + 1])
                self.sections[UsCaV1.NAME] = section
            elif (sectionIds[i] == UsVaV1.ID) :
                section = UsVaV1(encodedSections[i + 1])
                self.sections[UsVaV1.NAME] = section
            elif (sectionIds[i] == UsCoV1.ID) :
                section = UsCoV1(encodedSections[i + 1])
                self.sections[UsCoV1.NAME] = section
            elif (sectionIds[i] == UsUtV1.ID) :
                section = UsUtV1(encodedSections[i + 1])
                self.sections[UsUtV1.NAME] = section
            elif (sectionIds[i] == UsCtV1.ID) :
                section = UsCtV1(encodedSections[i + 1])
                self.sections[UsCtV1.NAME] = section
            elif (sectionIds[i] == UsFlV1.ID) :
                section = UsFlV1(encodedSections[i + 1])
                self.sections[UsFlV1.NAME] = section
            elif (sectionIds[i] == UsMtV1.ID) :
                section = UsMtV1(encodedSections[i + 1])
                self.sections[UsMtV1.NAME] = section
            elif (sectionIds[i] == UsOrV1.ID) :
                section = UsOrV1(encodedSections[i + 1])
                self.sections[UsOrV1.NAME] = section
            elif (sectionIds[i] == UsTxV1.ID) :
                section = UsTxV1(encodedSections[i + 1])
                self.sections[UsTxV1.NAME] = section
            elif (sectionIds[i] == UsDeV1.ID) :
                section = UsDeV1(encodedSections[i + 1])
                self.sections[UsDeV1.NAME] = section
            elif (sectionIds[i] == UsIaV1.ID) :
                section = UsIaV1(encodedSections[i + 1])
                self.sections[UsIaV1.NAME] = section
            elif (sectionIds[i] == UsNeV1.ID) :
                section = UsNeV1(encodedSections[i + 1])
                self.sections[UsNeV1.NAME] = section
            elif (sectionIds[i] == UsNhV1.ID) :
                section = UsNhV1(encodedSections[i + 1])
                self.sections[UsNhV1.NAME] = section
            elif (sectionIds[i] == UsNjV1.ID) :
                section = UsNjV1(encodedSections[i + 1])
                self.sections[UsNjV1.NAME] = section
            elif (sectionIds[i] == UsTnV1.ID) :
                section = UsTnV1(encodedSections[i + 1])
                self.sections[UsTnV1.NAME] = section
            elif (sectionIds[i] == UsMnV1.ID) :
                section = UsMnV1(encodedSections[i + 1])
                self.sections[UsMnV1.NAME] = section
            elif (sectionIds[i] == UsMdV1.ID) :
                section = UsMdV1(encodedSections[i + 1])
                self.sections[UsMdV1.NAME] = section
            elif (sectionIds[i] == UsInV1.ID) :
                section = UsInV1(encodedSections[i + 1])
                self.sections[UsInV1.NAME] = section
            elif (sectionIds[i] == UsKyV1.ID) :
                section = UsKyV1(encodedSections[i + 1])
                self.sections[UsKyV1.NAME] = section
            elif (sectionIds[i] == UsRiV1.ID) :
                section = UsRiV1(encodedSections[i + 1])
                self.sections[UsRiV1.NAME] = section
        self.decoded = True
        self.dirty = False

    def toObject(self):
        if self.decoded == False and self.encodedString != None and len(self.encodedString) > 0:
            try:
                self.decode(self.encodedString)
            except Exception as error:
                print("error occured:", error)
        obj = {}
        for i in range(len(Sections.SECTION_ORDER)):
            sectionName = Sections.SECTION_ORDER[i]
            if sectionName in self.sections:
                obj[sectionName] = self.sections[sectionName].toObj()
        return obj