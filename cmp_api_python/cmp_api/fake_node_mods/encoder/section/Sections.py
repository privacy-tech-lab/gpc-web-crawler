#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
import os
sys.path.insert(0, str(os.path.dirname(os.path.abspath(__file__)))) 
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

class Sections:
    SECTION_ID_NAME_MAP = {
        TcfEuV2.ID: TcfEuV2.NAME,
        TcfCaV1.ID: TcfCaV1.NAME,
        UspV1.ID: UspV1.NAME,
        UsNatV1.ID: UsNatV1.NAME,
        UsCaV1.ID: UsCaV1.NAME,
        UsVaV1.ID: UsVaV1.NAME,
        UsCoV1.ID: UsCoV1.NAME,
        UsUtV1.ID: UsUtV1.NAME,
        UsCtV1.ID: UsCtV1.NAME,
        UsFlV1.ID: UsFlV1.NAME,
        UsMtV1.ID: UsMtV1.NAME,
        UsOrV1.ID: UsOrV1.NAME,
        UsTxV1.ID: UsTxV1.NAME,
        UsDeV1.ID: UsDeV1.NAME,
        UsIaV1.ID: UsIaV1.NAME,
        UsNeV1.ID: UsNeV1.NAME,
        UsNhV1.ID: UsNhV1.NAME,
        UsNjV1.ID: UsNjV1.NAME,
        UsTnV1.ID: UsTnV1.NAME,
        UsMnV1.ID: UsMnV1.NAME,
        UsMdV1.ID: UsMdV1.NAME,
        UsInV1.ID: UsInV1.NAME,
        UsKyV1.ID: UsKyV1.NAME,
        UsRiV1.ID: UsRiV1.NAME
    }
    SECTION_ORDER = [
    TcfEuV2.NAME,
    TcfCaV1.NAME,
    UspV1.NAME,
    UsNatV1.NAME,
    UsCaV1.NAME,
    UsVaV1.NAME,
    UsCoV1.NAME,
    UsUtV1.NAME,
    UsCtV1.NAME,
    UsFlV1.NAME,
    UsMtV1.NAME,
    UsOrV1.NAME,
    UsTxV1.NAME,
    UsDeV1.NAME,
    UsIaV1.NAME,
    UsNeV1.NAME,
    UsNhV1.NAME,
    UsNjV1.NAME,
    UsTnV1.NAME,
    UsMnV1.NAME,
    UsMdV1.NAME,
    UsInV1.NAME,
    UsKyV1.NAME,
    UsRiV1.NAME
    ]