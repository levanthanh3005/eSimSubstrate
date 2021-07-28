#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod esimsm {
    #[cfg(not(feature = "ink-as-dependency"))]
    #[ink(storage)]
    pub struct ESimCtrl {
        user_role: ink_storage::collections::HashMap<AccountId, i32>,
        /// Role 0: Admin, 1: normal user
        /// The i32 of each user.
        data_amount: ink_storage::collections::HashMap<AccountId, i32>,
    }

    impl ESimCtrl {
        #[ink(constructor)]
        pub fn new() -> Self {
            let data_amount = ink_storage::collections::HashMap::new();
            let mut user_role = ink_storage::collections::HashMap::new();
            user_role.insert(Self::env().caller(), 0);
            Self {
                data_amount,
                user_role
            }
        }

        #[ink(message)]
        pub fn read_gb_amount_of(&self, owner: AccountId) -> i32 {
            let role = self.get_role(&Self::env().caller());
            if role == 1 {
                return 0
            }
            self.gb_of_or_zero(&owner)
        }

        #[ink(message)]
        pub fn my_gb_amount(&self) -> i32 {
            self.gb_of_or_zero(&Self::env().caller())
        }

        #[ink(message)]
        pub fn register(&mut self)  -> bool{
            let user_exist = self.user_role.contains_key(&Self::env().caller());
            if user_exist == true {
                return false
            }

            self.user_role.insert(Self::env().caller(), 1);
            self.data_amount.insert(Self::env().caller(), 10);
            return true
        }

        #[ink(message)]
        pub fn assign_role(&mut self, to: AccountId, _role: i32) -> bool {
            let role = self.get_role(&Self::env().caller());
            if role == 1 {
                return false
            }
            self.user_role[&to] = _role;
            return true
        }

        #[ink(message)]
        pub fn add_gb_amount(&mut self,to: AccountId, by: i32) -> bool {
            let role = self.get_role(&Self::env().caller());
            if role == 1 {
                return false
            }
            let _oldv = self.read_gb_amount_of(to); 

            self.data_amount
                .entry(to)
                .and_modify(|oldv| *oldv+=by)
                .or_insert(by);
            true
        }

        #[ink(message)]
        pub fn reduce_gb_amount(&mut self,to: AccountId, by: i32) -> bool {
            let role = self.get_role(&Self::env().caller());
            if role == 1 {
                return false
            }
            let mut _nv = self.read_gb_amount_of(to) - by; 
            if _nv < 0 {
                _nv = 0
            }

            // self.data_amount
            //     .entry(to)
            //     .and_modify(|oldv| *oldv-=by)
            //     .or_insert(by);
            (*self.data_amount.get_mut(&to).unwrap()) = _nv;
            true
        }

        #[ink(message)]
        pub fn my_role(&self) -> i32 {
            let r = self.get_role(&Self::env().caller());
            return r
        }

        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, value: i32) -> bool {
            self.transfer_from_to(self.env().caller(), to, value)
        }

        fn transfer_from_to(&mut self, from: AccountId, to: AccountId, value: i32) -> bool {
            let from_gb = self.gb_of_or_zero(&from);
            if from_gb < value {
                return false
            }

            // Update the sender's i32.
            self.data_amount.insert(from, from_gb - value);

            // Update the receiver's i32.
            let to_gb = self.gb_of_or_zero(&to);
            self.data_amount.insert(to, to_gb + value);

            true
        }

        fn gb_of_or_zero(&self, owner: &AccountId) -> i32 {
            *self.data_amount.get(owner).unwrap_or(&0)
        }

        fn get_role(&self, owner: &AccountId) -> i32 {
            *self.user_role.get(owner).unwrap_or(&-1)
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        use ink_lang as ink;

        #[ink::test]
        fn startup() {
            let contract = ESimCtrl::new();
            assert_eq!(contract.my_role(), 0);
        }

        #[ink::test]
        fn addgb() {
            let mut contract = ESimCtrl::new();
            assert!(contract.add_gb_amount(AccountId::from([0x0; 32]),100));
            assert_eq!(contract.read_gb_amount_of(AccountId::from([0x0; 32])), 100);
        }

        #[ink::test]
        fn reducegb() {
            let mut contract = ESimCtrl::new();
            assert!(contract.add_gb_amount(AccountId::from([0x0; 32]),100));
            assert_eq!(contract.read_gb_amount_of(AccountId::from([0x0; 32])), 100);
            assert!(contract.reduce_gb_amount(AccountId::from([0x0; 32]),10));
            assert_eq!(contract.read_gb_amount_of(AccountId::from([0x0; 32])), 90);
        }

        // #[ink::test]
        // fn transfer_works() {
        //     let mut contract = Erc20::new(100);
        //     assert_eq!(contract.i32_of(AccountId::from([0x1; 32])), 100);
        //     assert!(contract.transfer(AccountId::from([0x0; 32]), 10));
        //     assert_eq!(contract.i32_of(AccountId::from([0x0; 32])), 10);
        //     assert!(!contract.transfer(AccountId::from([0x0; 32]), 100));
        // }
    }
}
