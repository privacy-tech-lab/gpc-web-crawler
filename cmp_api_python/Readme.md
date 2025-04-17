GPP String Decoder
==================

This tool decodes Global Privacy Platform (GPP) strings.

Requirements:
-------------
- Python 3.10 or higher

Usage:
------
Run the Python script directly:

python decode_gpp.py

You'll be prompted to enter the GPP string:

Example:
--------
> python decode_gpp.py
Enter GPP string: DBABBg~BUUAAAGA.YA
Decoded result: {'uscav1': {'Version': 1, 'SaleOptOutNotice': 1, 'SharingOptOutNotice': 1, 'SensitiveDataLimitUseNotice': 0, 'SaleOptOut': 1, 'SharingOptOut': 1, 'SensitiveDataProcessing': [0, 0, 0, 0, 0, 0, 0, 0, 0], 'KnownChildSensitiveDataConsents': [0, 0], 'PersonalDataConsents': 1, 'MspaCoveredTransaction': 2, 'MspaOptOutOptionMode': 0, 'MspaServiceProviderMode': 0, 'GpcSegmentType': 1, 'Gpc': True}}
