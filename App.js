/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import 'react-native-gesture-handler';

import React, {useState, useEffect} from 'react';
import { View, Text,StyleSheet,Alert,Picker,TextInput,TouchableOpacity, ActivityIndicator } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from '@react-navigation/stack';

import Geolocation from '@react-native-community/geolocation';
navigator.geolocation = require('@react-native-community/geolocation');
import { firebase } from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { notifications } from "react-native-firebase-push-notifications"

import { ListItem, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
Icon.loadFont();

import AddCommute from './AddCommute'
import Loading from './Loading'
import Main from './Main'
import Login from './Login'
import SignUp from './SignUp'


async function onSignIn() {
  // Get the users ID
  const uid = auth().currentUser.uid;

  // Create a reference
  const ref = database().ref(`/users/test_user`); // database().ref(`/users/${uid}`);

  // Fetch the data snapshot
  const snapshot = await ref.once('value');

  return snapshot.val();
}

async function addNewCommute(fromAddress,toAddress,time){
  // Get the users ID
  const uid = 'test_user'//auth().currentUser.uid;

  // Create a reference
  const ref = database().ref(`/users/test_user/commutes`);

  await ref.push().set({
    from: fromAddress,
    to:toAddress,
    beginHour:time.getHours(),
    beginMinutes:time.getMinutes()
  });
}


async function deleteAllCommutes(viewRefreshFunction){
  const ref = database().ref(`/users/test_user/commutes`);
  ref.remove()
  .then((data)=>{
    Alert.alert("Succesfully deleted commutes")
    viewRefreshFunction();
    })
  .catch(error=>"Error deleting:"+error);

}

function testSubmit(navigation,route,state){
  console.log("Seeing on other side");
  console.log("--Navigation keys ");

  console.log(Object.keys(navigation));
  console.log("--Route keys");
  console.log(Object.keys(route));

  console.log((route["params"]));
  route.params.refreshCommutes();
  navigation.navigate({ name: 'commutes' });

}

async function submitNewCommuteButton (navigation,route,state){
  Alert.alert(
    'New Commute',
    `Would you like to add the following commute?:\nFrom:${state.from}\nTo:${state.to}\n${state.time}`,
    [
      {text:'Cancel',onPress:()=>(console.log('Cancelled adding commute'))},
      {text: 'OK', onPress: () => {
        addNewCommute(state.from,state.to,state.time).then( (data)=> {

          route.params.refreshCommutes();
          navigation.navigate({ name: 'commutes' });
          Alert.alert("Succesfully added commute");

          }).catch((error)=>{
            Alert.alert("Adding commute failed\n:"+error);
            });
            }},
    ],
    {cancelable: true},
  );

}


// const Tab = createBottomTabNavigator();
// const Stack = createStackNavigator();


// class MainAppScreens extends React.Component{
//   constructor(props){
//     super(props);
//   }
//
//
//   render(){
//     return (
//     <Stack.Navigator >
//       <Stack.Screen name="commutes" component={ExistingCommutes}  options={{headerShown: false,title:"Existing Commutes"}}/>
//       <Stack.Screen name="addNewCommute" component={AddCommute} options={{headerShown: true,title:"Add new commute"}}/>
//     </Stack.Navigator>);
//
//   }
//
// }


const Stack = createStackNavigator();

export default class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {isLoggedIn : false}
  }

  render (){
    return (
      <NavigationContainer>
        <Stack.Navigator>
              <Stack.Screen name="Loading" component={Loading} />
              <Stack.Screen name="Main" component={Main} options={{headerShown: false}} />
              <Stack.Screen name="AddCommute" component={AddCommute} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="SignUp" component={SignUp} options={{headerShown: false}} />



        </Stack.Navigator>
      </NavigationContainer>
    );

  }
}
