# eSim in Substrate

## Clone project

```
git clone https://github.com/levanthanh3005/eSimSubstrate
cd eSimSubstrate
```

## Environment preparation

```
docker run -it --rm \
	--network host \
    --name polkadot \
    -v "$(pwd):/todo" \
	levanthanh3005/substrate:v0.1
```

Then in this terminal, we start substrate canvas node
Reference : https://substrate.dev/substrate-contracts-workshop/#/0/canvas-node

```
canvas --dev --tmp
```


## Smart Contract

Then open another terminal and execute into the polkadot container
```
docker exec -it polkadot bash
cargo contract new esim
cd esim
```

Copy and Paste `/SmartContract/eSim.rs` into `lib.rs`, next is test and build in esim

```
cargo +nightly test
cargo +nightly contract build
```

After that we have `esim.contract` in `target/ink/esim.contract`
Access https://paritytech.github.io/canvas-ui/#/, let it connect to localhost, choose Upload and Instantitate Contract, and upload `esim.contract` here, do the next steps until the contract is already deployed into substrate.

## Frontend
```
docker run -d \
 -p 3003:8000 \
 --name frontend \
 -v "$(pwd)/Frontend/config/metadata.json:/usr/local/nvm/substrate-front-end-template/src/config/metadata.json" \
 -v "$(pwd)/Frontend/App.js:/usr/local/nvm/substrate-front-end-template/src/App.js" \
 -v "$(pwd)/Frontend/TemplateModule.js:/usr/local/nvm/substrate-front-end-template/src/TemplateModule.js" \
levanthanh3005/substrate-fontend-ui:v0
```
Before accessing, please make sure your smart contract address and abi in `TemplateModule.js` is correct

Now, lets go to http://localhost:3003 and enjoy.

## Live demo

https://youtu.be/GgEKWD47ZiY

# Happy blockchain