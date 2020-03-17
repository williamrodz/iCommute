/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import 'react-native-gesture-handler';

import * as React from 'react';
import { View, Text,StyleSheet,Alert,Picker,TextInput } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
navigator.geolocation = require('@react-native-community/geolocation');
import { firebase } from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
const apiKeys = require('./apiKeys.json');
import { ListItem, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
Icon.loadFont();



const homePlace = { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }};
const workPlace = { description: 'Work', geometry: { location: { lat: 48.8496818, lng: 2.2940881 } }};


var globalFromAddress= 'IOTA_FROM';
var globalToAddress= 'IOTA_TO';

const DISTANCES_API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json?'

function processDistanceJSON(distanceJSON){
    const responseKeys = Object.keys(distanceJSON);
    // if (distanceJSON["status"] == 'OK'){
    const firstDistanceElement = distanceJSON.rows[0].elements[0];
    //[{"distance": {"text": "151 km", "value": 151114}, "duration": {"text": "2 hours 15 mins", "value": 8115}, "status": "OK"}]
    const distanceText = firstDistanceElement.distance.text;
    const durationText = firstDistanceElement.duration.text;
    return {distanceText:distanceText,durationText:durationText}
}


async function getDistance(start,end){

  var requestUrl = "https://us-central1-icommute-firebase.cloudfunctions.net/getDistance?";
  requestUrl+=`from=${start}&to=${end}`

  console.log("requestUrl:\n",requestUrl);
  return fetch(requestUrl,{method:'POST'})
  .then((response) => {
    console.log("response:\n");
    return response.json();

    })
  .then( (responseJson) => {
    console.log(responseJson);
    return responseJson;
    })
}

async function getDistanceButton(){
  transitInfo = await getDistance("428 Memorial, Dr, Cambridge,MA","77 Massachusetts Ave,Cambridge, MA");
  Alert.alert(
    'Distance Calculated',
    'Distance: '+transitInfo.distanceText+'\nTime: '+transitInfo.durationText
    )


}

class GooglePlacesInput extends React.Component{


  render (){
    return (
      <GooglePlacesAutocomplete
        placeholder='Search'
        minLength={4} // minimum length of text to search
        autoFocus={true}
        returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
        keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
        listViewDisplayed='auto'    // true/false/undefined
        fetchDetails={true}
        renderDescription={row => row.description} // custom description render
        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
          this.props.processAddressFunction(details['formatted_address']);

        }}

        getDefaultValue={() => ''}
        query={{
          // available options: https://developers.google.com/places/web-service/autocomplete
          key: apiKeys.googleplaces,
          language: 'en', // language of the results
        }}

        styles={{
          textInputContainer: {
            width: '100%',
          },
          description: {
            fontWeight: 'bold'
          },
          predefinedPlacesDescription: {
            color: '#1faadb'
          }
        }}

        currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
        currentLocationLabel="Current location"
        nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
        GoogleReverseGeocodingQuery={{
          // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
        }}
        GooglePlacesSearchQuery={{
          // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
          rankby: 'distance',
          type: 'cafe'
        }}

        GooglePlacesDetailsQuery={{
          // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
          fields: 'formatted_address',
        }}

        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
        predefinedPlaces={[homePlace, workPlace]}

        debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
      />
    );

  }


}

function getPickerItem(label,item,key){
  return <Picker.Item label={item} value={item} key={key}/>
}


async function onSignIn() {
  // Get the users ID
  const uid = auth().currentUser.uid;

  // Create a reference
  const ref = database().ref(`/users/test_user`); // database().ref(`/users/${uid}`);

  // Fetch the data snapshot
  const snapshot = await ref.once('value');

  return snapshot.val();
}

async function addNewCommute(fromAddress,toAddress){
  // Get the users ID
  const uid = 'test_user'//auth().currentUser.uid;

  // Create a reference
  const ref = database().ref(`/users/test_user/commutes`);

  await ref.push().set({
    from: fromAddress,
    to:toAddress
  });
}


async function getCommutes() {
  // Get the users ID
  // const uid = auth().currentUser.uid;

  // Create a reference
  const ref = database().ref(`/users/test_user/commutes`);

  // Fetch the data snapshot
  const snapshot = await ref.once('value');
  var addresses = [];
  const snapShotCommutes = snapshot.val();
  const timestampKeys = Object.keys(snapShotCommutes);
  commutes = [];
  timestampKeys.forEach((item, i) => {
    commutes.push(snapShotCommutes[item])
  });
  return commutes;
}

function setFromAddress(address){
  globalFromAddress = address;
  console.log(`Set from address to ${address}`);

}

function setToAddress(address){
  globalToAddress = address;
  console.log(`Set to address to ${address}`);


}

async function submitNewCommuteButton (navigation){
  Alert.alert(
    'New Commute',
    `Would you like to add the following commute?:\nFrom:${globalFromAddress}\nTo:${globalToAddress}`,
    [
      {text:'Cancel',onPress:()=>(console.log('Cancelled adding commute'))},
      {text: 'OK', onPress: () => {
        addNewCommute(globalFromAddress,globalToAddress).then( (data)=> {
          Alert.alert("Succesfully added commute");
          navigation.navigate({ name: 'commutes' });


          }).catch((error)=>{
            Alert.alert("Adding commute failed\n:"+error);
            });
            }},
    ],
    {cancelable: true},
  );

}

async function getCommutesButton(){
  var user_data = getCommutes();

  user_data.then(
    (data) => {
      output = '';
      data.forEach((item, i) => {
        output+= `from:${item.from} to:${item.to}\n`
      });

      Alert.alert(
        "Succesfully retrieved commutes",`Commutes are ${output}`)

    }
    ).catch(
      (error) => {
        Alert.alert("Error retrieving\n"+error);
      }
      )

}

class MainView extends React.Component{
  constructor(props) {
    super(props)
    this.handler = this.handler.bind(this)
  }

  handler() {
    this.setState({
      someVar: 'some value'
    })
  }

  render() {
    return <Child handler = {this.handler} />
  }
}


function logAddresses(){
  Alert.alert("Global addresses","globalFromAddress: "+globalFromAddress+"\nglobalToAddress: "+globalToAddress)

}

class Child extends React.Component {
  render() {
    return <Button onClick = {this.props.handler}/ >
  }
}

class AddCommuteScreen extends React.Component {
  constructor(props){
    super(props);
    console.log("------PROPS ARE------");
    console.log(props);
    const daysOfTheWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]


  }



  render (){
    return (
      <View style={{flex:1,backgroundColor:'bisque',alignItems:'center',justifyContent:'center',paddingTop:100}}>
        <Text style={{fontSize:20,paddingBottom:10}}>What's your home address?</Text>
        <GooglePlacesInput processAddressFunction = {setFromAddress}/>
        <Text style={{fontSize:20}}>Where's work?</Text>
        <GooglePlacesInput processAddressFunction = {setToAddress}/>
        <Button style={{color:'red'}} title="Submit" onPress={()=> submitNewCommuteButton(this.props.navigation)}/>
        <Button style={{paddingBottom:20}} title="Get commutes" onPress={getCommutesButton}/>
        <Button style={{paddingBottom:20}} title="Log from and to" onPress={logAddresses}/>

        <Button style={{paddingBottom:20}} title="Get distance" onPress={getDistanceButton}/>
        <Button style={{paddingBottom:20}} title="Return" onPress={()=>this.props.navigation.navigate({ name: 'commutes' })}/>




      </View>
    );

  }


}


function AddressRevealButton(){
  return (
    <Button title="reveal" onPress={()=>this.state.myText = ":)"}>
    </Button>

    );
}


const list = [
  {
    title: 'Appointments',
    icon: 'av-timer'
  },
  {
    title: 'Trips',
    icon: 'flight-takeoff'
  },
]

function testAlert(){
  Alert.alert("Test alert","testing...")
}


class CommutesListView extends React.Component{
  constructor (props){
    super(props);
    this.state = {commutes:[]}
  }


  async componentDidMount(){
    const userCommutes = await getCommutes();
    this.setState({commutes:userCommutes});

  }

  render(){
    const listItems = []
    this.state.commutes.forEach((item, i) => {
      listItems.push(<ListItem key={i} title={item.from +' to '+item.to} onPress={testAlert} bottomDivider/>)
    });

    return <View style={this.props.style}>{listItems}</View>;
  }
}


function ExistingCommutesScreen({navigation}) {
  return (
    <View style={{flex:1,alignItems:'stretch',...StyleSheet.absoluteFillObject}}>
      <View style={{flex:1,alignItems:'center',backgroundColor:'green',paddingTop:40}}>
        <View >
          <Text style={{fontSize:30}}>Saved Commutes</Text>
          <Button title="Add Commute"
            onPress = {() => {
              this.handler;
              navigation.navigate('addNewCommute')}
            }
            style={{paddingTop:10,paddingBottom:10}} icon={<Icon name="plus" size={15} color="white"/>}/>
        </View>
        <CommutesListView style={{width:"100%",backgroundColor:'white'}}/>
      </View>
    </View>
  );
}



const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


class MainAppScreens extends React.Component{
  constructor(props){
    super(props);
    // this.state = {headerShown:false};
  }


  render(){
    return (
    <Stack.Navigator >
      <Stack.Screen name="commutes" component={ExistingCommutesScreen}  options={{headerShown: false,title:"Existing Commutes"}}/>
      <Stack.Screen name="addNewCommute" component={AddCommuteScreen} options={{headerShown: true,title:"Add new commute"}}/>
    </Stack.Navigator>);

  }

}

function App() {
    this.state = {
      myText: 'hello'
    }
  return (
    <NavigationContainer>
      <MainAppScreens/>
    </NavigationContainer>
  );
}

export default App;
