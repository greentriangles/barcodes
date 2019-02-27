# Ingress Barcode Mapper API

This gadget maps Ingress 'barcode' agent names into human-memorable ones.

## Calling the API

The '@' symbol is optional in all cases.

### Single-agent (/barcode)

```
$ curl https://us-central1-ingress-barcodes.cloudfunctions.net/barcode?agent=@iiililililil
{"barcode_name":"@iiililililil","given_name":"BoilingDonkey","integer_value":4435}

$ curl -X POST -H "Content-Type:application/json" -d '{"agent":"iiillllllillill"}' https://us-central1-ingress-barcodes.cloudfunctions.net/barcode
{"barcode_name":"iiillllllillill","given_name":"PricklyScorpion","integer_value":36825}
```

### Multi-agent (/barcodemulti)

```
$ curl https://us-central1-ingress-barcodes.cloudfunctions.net/barcodemulti?agents=iillllllillil,iillllllilli
{"iillllllillil":{"barcode_name":"iillllllillil","given_name":"CluelessToffee","integer_value":10219},"iillllllilli":{"barcode_name":"iillllllilli","given_name":"BraveUvula","integer_value":5108}}

$ curl -X POST -H "Content-Type:application/json" -d '{"agents":["IIIllllllIllIll","ILIllllllILlIlI"]}' https://us-central1-ingress-barcodes.cloudfunctions.net/barcodemulti
{"IIIllllllIllIll":{"barcode_name":"iiillllllillill","given_name":"PricklyScorpion","integer_value":36825},"ILIllllllILlIlI":{"barcode_name":"ilillllllillili","given_name":"SilkyScarf","integer_value":45016}}
```

## Reliability

It's an unpaid project hosted in Google's cloud.  It'll be pretty relible
until Google loses interest, and then it'll probably break.  If that's a
concern, take a copy of the code and host it yourself.

## How it Works

Ingress agent names are 1-15 characters long, while barcode names consist of
combinations of 'I' and 'l' which are homoglyphic in the relevant typefaces.
Treating these agent names as base-2 representations, the resulting set of
integers has `2^1 + 2^2 + ... + 2^15` possibilities, in total comprising
2^16-2 unique values; these map neatly into the 16-bit integer space, and are
so conveniently represented as a pair of words drawn from a 256-word
dictionary.  For memorability and amusement, the first word is taken from a
set of English adjectives, while the second is a set of English nouns,
yielding such translated names as "ShaggyPelvis."

## License.

GPLv3 or later.

