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
        UsCtV1.ID: UsCtV1.NAME
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
    UsCtV1.NAME
    ]