import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Form, Dropdown, Input, Label, Button , Card, Image, Loader} from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import { TxButton, TxGroupButton } from './substrate-lib/components';

import { ContractPromise } from '@polkadot/api-contract';

import metadata from "./config/metadata.json";


export default function Main (props) {
  const { api, jsonrpc } = useSubstrate();
  const { accountPair } = props;


  let initialValues = {
    myGB : 0,
    accountRole : 1,
    userAccToGb : '',
    gbOfAcc: undefined,
    loading: false
  }
  const [inputs,setInputs] = useState(initialValues);
  const onChangeHandler = useCallback(
    ({target:{name,value}}) => setInputs(state => ({ ...state, [name]:value }), [])
  );
  
  const contractAddress = "5D1vVvNk4EPnytJgu9nVXtLd9BLPc6jciYMapwXMCbG3ZK5C"
  //   const abiJSONobj = (metadata);
  const contract = new ContractPromise(api, metadata, contractAddress);
  // console.log(contract)
  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected }
    } = accountPair;
    let fromAcct;

    // signer is from Polkadot-js browser extension
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = address;
      api.setSigner(injected.signer);
    } else {
      fromAcct = accountPair;
    }

    return fromAcct;
  };

  const userRoleList = [
          {
            key: '0',
            text: 'Admin',
            value: 0
          },
          {
            key: '1',
            text: 'User',
            value: 1
          }
        ];

  const loadMyRole = () => {
    (async function () {
        if (accountPair) {
            // setInputs(state => ({ ...state, ["loading"]:true }), [])

            // Read from the contract via an RPC call
            const value = 0; // only useful on isPayable messages
    
            // NOTE the apps UI specified these in mega units
            const gasLimit = 3000n * 1000000n;
    
            const { gasConsumed, result, output } = await contract.query.myRole(accountPair.address, { value, gasLimit });
            // console.log(result.toHuman());
    
            // gas consumed
            // console.log(gasConsumed.toHuman());
            if (result.isOk) {
            // should output 123 as per our initial set (output here is an i32)
                // console.log('Success', output.toHuman());
            setInputs(state => ({ ...state, ["accountRole"]:output.toHuman() }), [])
            // setInputs(state => ({ ...state, ["loading"]:false }), [])

            } else {
                console.error('Error', result.asErr);
            }
        }
      })();
  }
  
  useEffect(loadMyRole, [contract,accountPair]);

  const readGBAmountOfAcc = () => {
    console.log("Read GB of ",inputs.userAccToGb);
    // setInputs(state => ({ ...state, ["gbOfAcc"]:10 }), [])

    (async function () {
      if (accountPair) {
          setInputs(state => ({ ...state, ["loading"]:true }), [])

          // Read from the contract via an RPC call
          const value = 0; // only useful on isPayable messages

          // NOTE the apps UI specified these in mega units
          const gasLimit = 5000n * 1000000n;

          const { gasConsumed, result, output } = await contract.query.readGbAmountOf(accountPair.address, { value, gasLimit }, inputs.userAccToGb);
          console.log(result.toHuman());

          // gas consumed
          // console.log(gasConsumed.toHuman());
          if (result.isOk) {
          // should output 123 as per our initial set (output here is an i32)
              console.log('Success', output.toHuman());
              // setReadGBAccValue(output.toHuman())
              setInputs(state => ({ ...state, ["gbOfAcc"]:output.toHuman() }), [])
              setInputs(state => ({ ...state, ["loading"]:false }), [])

          } else {
              console.error('Error', result.asErr);
          }
      }
    })();
  }

  const addGbToAcc = () => {
    console.log("addGbToAcc: ",inputs.userAccToAddGb, " ",inputs.gbToAddUser);
    (async function () {
      if (accountPair) {
          setInputs(state => ({ ...state, ["loading"]:true }), [])

          const fromAcct = await getFromAcct();

          const value = 0; 
          const gasLimit = 8000n * 1000000n;
          await contract.tx
            .addGbAmount({ value, gasLimit },inputs.userAccToAddGb,inputs.gbToAddUser)
            .signAndSend(fromAcct, (result) => {
              if (result.status.isInBlock) {
                console.log('in a block');
                // setAccountRole(1);//default user

              } else if (result.status.isFinalized) {
                setInputs(state => ({ ...state, ["userAccToAddGb"]:"" }), [])
                setInputs(state => ({ ...state, ["gbToAddUser"]:0 }), [])
                setInputs(state => ({ ...state, ["loading"]:false }), [])

                console.log('finalized');
              }
            });
      }
    })();
  }

  const removeGbToAcc = () => {
    console.log("removeGbToAcc: ",inputs.userAccToRemoveGb, " ",inputs.gbToRemoveUser);
    (async function () {
      if (accountPair) {
          setInputs(state => ({ ...state, ["loading"]:true }), [])

          const fromAcct = await getFromAcct();

          const value = 0; 
          const gasLimit = 8000n * 1000000n;
          await contract.tx
            .reduceGbAmount({ value, gasLimit },inputs.userAccToRemoveGb,inputs.gbToRemoveUser)
            .signAndSend(fromAcct, (result) => {
              if (result.status.isInBlock) {
                console.log('in a block');
                // setAccountRole(1);//default user
              } else if (result.status.isFinalized) {
                setInputs(state => ({ ...state, ["userAccToRemoveGb"]:"" }), [])
                setInputs(state => ({ ...state, ["gbToRemoveUser"]:0 }), [])
                setInputs(state => ({ ...state, ["loading"]:false }), [])

                console.log('finalized');
              }
            });
      }
    })();
  }

  const transferGbToAcc = () => {
    console.log("transferGbToAcc: ",inputs.frAccToTransfer, " ",inputs.frAmountToTransfer);
    (async function () {
      if (accountPair) {
          setInputs(state => ({ ...state, ["loading"]:true }), [])

          const fromAcct = await getFromAcct();

          const value = 0; 
          const gasLimit = 8000n * 1000000n;
          await contract.tx
            .transfer({ value, gasLimit },inputs.frAccToTransfer,inputs.frAmountToTransfer)
            .signAndSend(fromAcct, (result) => {
              if (result.status.isInBlock) {
                console.log('in a block');
                // setAccountRole(1);//default user
              } else if (result.status.isFinalized) {
                setInputs(state => ({ ...state, ["frAccToTransfer"]:"" }), [])
                setInputs(state => ({ ...state, ["frAmountToTransfer"]:0 }), [])
                setInputs(state => ({ ...state, ["loading"]:false }), [])

                console.log('finalized');
              }
            });
      }
    })();
  }

  const registerAcc = () => {

    (async function () {
      if (accountPair) {
          setInputs(state => ({ ...state, ["loading"]:true }), [])

          const fromAcct = await getFromAcct();

          const value = 0; 
          const gasLimit = 8000n * 1000000n;
          await contract.tx
            .register({ value, gasLimit })
            .signAndSend(fromAcct, (result) => {
              if (result.status.isInBlock) {
                console.log('in a block');
                // setAccountRole(1);//default user
                setInputs(state => ({ ...state, ["accountRole"]:1 }), [])
                setInputs(state => ({ ...state, ["loading"]:false }), [])

              } else if (result.status.isFinalized) {
                console.log('finalized');
              }
            });
      }
    })();
  }

  const assignUserRole = () => {
    console.log("New Role:"+inputs.accNewRole+" for "+inputs.userAccToChangeRole);
    (async function () {
      if (accountPair) {
          setInputs(state => ({ ...state, ["loading"]:true }), [])

          const fromAcct = await getFromAcct();

          const value = 0; 
          const gasLimit = 8000n * 1000000n;
          await contract.tx
            .assignRole({ value, gasLimit },inputs.userAccToChangeRole, inputs.accNewRole)
            .signAndSend(fromAcct, (result) => {
              if (result.status.isInBlock) {
                console.log('in a block');
                // setAccountRole(1);//default user
              } else if (result.status.isFinalized) {
                console.log('finalized');
                setInputs(state => ({ ...state, ["accountRole"]:inputs.accNewRole }), [])
                setInputs(state => ({ ...state, ["loading"]:false }), [])

              }

            });
      }
    })();
  }

  const getMyGB = () => {
    // setInputs(state => ({ ...state, ["myGB"]:1 }), [])
    (async function () {
        if (accountPair) {
            setInputs(state => ({ ...state, ["loading"]:true }), [])

            // Read from the contract via an RPC call
            const value = 0; // only useful on isPayable messages
    
            // NOTE the apps UI specified these in mega units
            const gasLimit = 5000n * 1000000n;
    
            const { gasConsumed, result, output } = await contract.query.myGbAmount(accountPair.address,{ value, gasLimit });
            console.log("readMyGB:")
            console.log(result.toHuman());
    
            // gas consumed
            // console.log(gasConsumed.toHuman());
            if (result.isOk) {
            // should output 123 as per our initial set (output here is an i32)
                console.log('Success', output.toHuman());
                // setMyGB(output.toHuman())
                setInputs(state => ({ ...state, ["myGB"]:output.toHuman() }), [])
                setInputs(state => ({ ...state, ["loading"]:false }), [])

            } else {
                console.error('Error', result.asErr);
            }
        }
      })();
  }

  const adminForm = () => {
    return (<div>
        <h2>Your role is Admin</h2>
    <Form>
      <Card.Group itemsPerRow={4}>
        <Card>
          <Card.Content>
            <Card.Header>GB of User</Card.Header>
            <Card.Meta>You can read the amound GB of any users</Card.Meta>
          </Card.Content>
          <Card.Content extra>
            <Form>
            <Form.Field>
              <label>User Account Id:</label>
                <input key="userAccToGb" name="userAccToGb" 
                  placeholder='Account Id'
                  onChange={onChangeHandler} value={inputs.userAccToGb}/>

              <label>{inputs.gbOfAcc == 0 || inputs.gbOfAcc ? "GB:"+inputs.gbOfAcc : ""}</label>
            </Form.Field>
              <div className='ui two buttons'>
                <Button basic color='green'
                  onClick={readGBAmountOfAcc}
                >
                  Read
                </Button>
              </div>
          </Form>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Card.Header>Assign User Role</Card.Header>
            <Card.Meta>You can change user role here</Card.Meta>
          </Card.Content>
          <Card.Content extra>
          <Form>
            <Form.Field>
                <label>User account:</label>
                <input key="userAccToChangeRole" name="userAccToChangeRole" 
                  placeholder='Account Id'
                  onChange={onChangeHandler} value={inputs.userAccToChangeRole}/>
                <label>New Role:</label>
              <Dropdown
                placeholder='Select User Role'
                fluid
                selection
                options={userRoleList}
                      onChange={(e, {value})=>{setInputs(state => ({ ...state, ["accNewRole"]: value }), [])}}
              />
            </Form.Field>
            <div className='ui two buttons'>
              <Button 
                basic color='green'
                    onClick={assignUserRole}
              >Change</Button>
            </div>
          </Form>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Card.Header>Add GB for User</Card.Header>
            <Card.Meta>You can add more GB for user</Card.Meta>
          </Card.Content>
          <Card.Content extra>
            <Form>
            <Form.Field>
              <label>User Account Id:</label>
              <input key="userAccToAddGb" name="userAccToAddGb" 
                  placeholder='Account Id'
                  onChange={onChangeHandler} value={inputs.userAccToAddGb}/>
              <label>Amount to add:</label>
              <input key="gbToAddUser" name="gbToAddUser" 
                  type="number"
                  placeholder='Amount to add'
                  onChange={onChangeHandler} value={inputs.gbToAddUser}/>
            </Form.Field>
              <div className='ui two buttons'>
                <Button basic color='green'
                  onClick={addGbToAcc}
                >
                  Trigger
                </Button>
              </div>
          </Form>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Card.Header>Remove GB from User</Card.Header>
            <Card.Meta>You can remove GB from user</Card.Meta>
          </Card.Content>
          <Card.Content extra>
            <Form>
            <Form.Field>
              <label>User Account Id:</label>
              <input key="userAccToRemoveGb" name="userAccToRemoveGb" 
                  placeholder='Account Id'
                  onChange={onChangeHandler} value={inputs.userAccToRemoveGb}/>
              <label>Amount to remove:</label>
              <input key="gbToRemoveUser" name="gbToRemoveUser" 
                  type="number"
                  placeholder='Amount to add'
                  onChange={onChangeHandler} value={inputs.gbToRemoveUser}/>
            </Form.Field>
              <div className='ui two buttons'>
                <Button basic color='green'
                  onClick={removeGbToAcc}
                >
                  Trigger
                </Button>
              </div>
          </Form>
          </Card.Content>
        </Card>
      </Card.Group>
        </Form>
    </div>)
  }
  const userForm = () => {
    return (<div>
      <h2>Your role is user</h2>
      <Form>
          <Card.Group>
      <Card>
        <Card.Content>
          <Card.Header>Your GB</Card.Header>
          <Card.Meta>You can read your GB here</Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <Form>
          <Form.Field>
            <label> GB :{inputs.myGB}</label>
          </Form.Field>
            <div className='ui two buttons'>
              <Button basic color='green'
                onClick={getMyGB}
              >
                Read
              </Button>
            </div>
        </Form>
        </Card.Content>
      </Card>
      <Card>
        <Card.Content>
          <Card.Header>Transfer</Card.Header>
          <Card.Meta>You can transfer your GB to your friends</Card.Meta>
        </Card.Content>
        <Card.Content extra>
        <Form>
          <Form.Field>
            <label>Your friend Account Id:</label>
            <input key="frAccToTransfer" name="frAccToTransfer" 
                placeholder='Account Id'
                onChange={onChangeHandler} value={inputs.frAccToTransfer}/>
            <label>Amount to remove:</label>
            <input key="frAmountToTransfer" name="frAmountToTransfer" 
                type="number"
                placeholder='Amount to send'
                onChange={onChangeHandler} value={inputs.frAmountToTransfer}/>

          </Form.Field>
          <div className='ui two buttons'>
            <Button 
              basic color='green'
              onClick={transferGbToAcc}
              >Send</Button>
          </div>
        </Form>
        </Card.Content>
      </Card>
      </Card.Group>
        </Form>
      </div>)
  }

  const unresgisteredUser = () => {
    return (<div>
      <Form>
    <Card.Group>
      <Card>
        <Card.Content>
          <Card.Header>You have not registered yet</Card.Header>
          <Card.Meta>please register to continue</Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <Form>
            <div className='ui two buttons'>
              <Button basic color='green'
                onClick={registerAcc}
              >
                Register
              </Button>
            </div>
        </Form>
        </Card.Content>
      </Card>
          </Card.Group>
        </Form>
      </div>)
  }

  return (
    <div>
      <Form loading={inputs.loading} >

          <Grid.Column>
            <h1>ESim controller</h1>
            {inputs.accountRole==0 
            ? adminForm() 
            : inputs.accountRole==1  
              ? userForm() 
              : unresgisteredUser() }
            
            </Grid.Column>

       </Form>
    </div>
  );
}
