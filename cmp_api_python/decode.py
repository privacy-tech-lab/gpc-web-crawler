from cmp_api import cmpapi_test
import pprint

def main():
    c = cmpapi_test.CmpApi()
    gpp_string = input("Enter a GPP string to decode: ").strip()
    result = cmpapi_test.decode(gpp_string, c)
    print("Decoded result:")
    pprint.pprint(result)

if __name__ == "__main__":
    main()
