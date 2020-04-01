/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import 'react-native-gesture-handler';

import * as React from 'react';
import { View, Text,StyleSheet,Alert,Picker,TextInput,TouchableOpacity } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
navigator.geolocation = require('@react-native-community/geolocation');
import { firebase } from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { notifications } from "react-native-firebase-push-notifications"


const apiKeys = require('./apiKeys.json');
import { ListItem, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
Icon.loadFont();


const homePlace = { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }};
const workPlace = { description: 'Work', geometry: { location: { lat: 48.8496818, lng: 2.2940881 } }};

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

  return fetch(requestUrl,{method:'POST'})
  .then((response) => {
    return response.json();

    })
  .then( (responseJson) => {
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


async function deleteAllCommutes(viewRefreshFunction){
  const ref = database().ref(`/users/test_user/commutes`);
  ref.remove()
  .then((data)=>{
    Alert.alert("Succesfully deleted commutes")
    viewRefreshFunction();
    })
  .catch(error=>"Error deleting:"+error);

}


class ExistingCommutesScreen extends React.Component {
  constructor(props){
    super(props);

    this.state = {commutes:false,listItems:[]}
    this.props.navigation.setParams({refresh:()=>console.log("Called refresh")});

  }

  getToken = async () => {
    //get the messeging token
    const token = await notifications.getToken()
    //you can also call messages.getToken() (does the same thing)
    console.log("Push Token is\n"+token);
    Alert.alert("Token",token);
    return token
  }
  getInitialNotification = async () => {
    //get the initial token (triggered when app opens from a closed state)
    const notification = await notifications.getInitialNotification()
    console.log("getInitialNotification", notification)
    return notification
  }

  onNotificationOpenedListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when the application is in the background
    this.removeOnNotificationOpened = notifications.onNotificationOpened(
      notification => {
        console.log("onNotificationOpened", notification)
        //do something with the notification
      }
    )
  }

  onNotificationListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when the application is in the forground/runnning
    //for android make sure you manifest is setup - else this wont work
    //Android will not have any info set on the notification properties (title, subtitle, etc..), but _data will still contain information
    this.removeOnNotification = notifications.onNotification(notification => {
      //do something with the notification
      console.log("onNotification", notification)
    })
  }

  onTokenRefreshListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when a new token is generated for the user
    this.removeonTokenRefresh = messages.onTokenRefresh(token => {
      //do something with the new token
    })
  }
  setBadge = async number => {
    //only works on iOS for now
    return await notifications.setBadge(number)
  }

  getBadge = async () => {
    //only works on iOS for now
    return await notifications.getBadge()
  }

  hasPermission = async () => {
    //only works on iOS
    return await notifications.hasPermission()
    //or     return await messages.hasPermission()
  }

  requestPermission = async () => {
    //only works on iOS
    return await notifications.requestPermission()
    //or     return await messages.requestPermission()
  }

  onTestHasPermission = async () => {
  const has = await this.hasPermission()
  console.log("Has", has)
  this.setState({ hasPermission: has })
}

  async componentDidMount(){

    const userCommutes = await getCommutes();
    this.setState({commutes:userCommutes});

    if (this.state.commutes){
      var newList = [];
      this.state.commutes.forEach((item, i) => {
        newList.push(<ListItem key={i} title={item.from +' to '+item.to} onPress={()=>Alert.alert(`${item.from}`)} bottomDivider/>)
      });
      this.setState({listItems:newList});
    }

    this.onNotificationListener()
    this.onNotificationOpenedListener()
    this.getInitialNotification()

  }

  componentWillUnmount() {
    //remove the listener on unmount
    if (this.removeOnNotificationOpened) {
      this.removeOnNotificationOpened()
    }
    if (this.removeOnNotification) {
      this.removeOnNotification()
    }

    if (this.removeonTokenRefresh) {
      this.removeonTokenRefresh()
    }
  }

  render(){
    return (
      <View style={{flex:1,alignItems:'stretch',...StyleSheet.absoluteFillObject}}>
        <View style={{flex:1,alignItems:'center',backgroundColor:'green',paddingTop:40}}>
          <View >
            <Text style={{fontSize:30}}>Your Commutes</Text>
            <Button title="Add Commute"
              onPress = {() => {
                this.props.navigation.navigate('addNewCommute',{refreshCommutes:()=>this.componentDidMount()});
              }}
              style={{paddingTop:10,paddingBottom:10}} icon={<Icon name="plus" size={15} color="white"/>}/>
          </View>
          <View style={{width:"100%",backgroundColor:'white'}}>{this.state.listItems}</View>
          <Button title="Delete all" onPress={()=>deleteAllCommutes(this.componentDidMount)}/>
          <Button title="Request Permissions" onPress={this.requestPermission}/>
          <Button title="Has permission" onPress={this.onTestHasPermission}/>

          <Button title="Get Token" onPress={this.getToken}/>
          <Button title="getInitialNotification" onPress={this.getInitialNotification}/>



        </View>
      </View>
    );

  }

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


class AddCommuteScreen extends React.Component {
  constructor(props){
    super(props);
    this.state={timePickerVisible:false}

  }



  render (){
    return (
      <View style={{flex:1,backgroundColor:'bisque',alignItems:'center',justifyContent:'center',paddingTop:100}}>
        <Text style={{fontSize:20,paddingBottom:10}}>What's your home address?</Text>
        <GooglePlacesInput processAddressFunction = {from=>this.setState({from:from})}/>
        <Text style={{fontSize:20}}>Where's work?</Text>
        <GooglePlacesInput processAddressFunction = {to=>this.setState({to:to})}/>
        <DateTimePickerModal
          isVisible={this.state.timePickerVisible}
          mode="time"
          onConfirm={(time)=>this.setState({timePickerVisible:false,time:time})}
          onCancel={()=>Alert.alert("canceled")}
        />
        <Button icon={<Icon name="clock-o" size={15} color="white"/>}
        style={{padding:5}} title="Set Time" onPress={()=>this.setState({timePickerVisible:true})}/>

        <Button buttonStyle={{backgroundColor:'green'}}containerStyle={{paddingBottom:40}} titleStyle={{color:"white"}}
        type="clear" title="Submit"
        disabled={!(this.state.from && this.state.to && this.state.time)}
        onPress={()=> submitNewCommuteButton(this.props.navigation,this.props.route,this.state)}/>
        <Button icon={<Icon name="clock-o" size={15} color="white"/>}
        style={{padding:5}} title="Test" onPress={()=>testSubmit(this.props.navigation,this.props.route,this.state)}/>


      </View>
    );
  }

}





const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


class MainAppScreens extends React.Component{
  constructor(props){
    super(props);
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

class RootContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      token: "",
      hasPermission: false
    }
  }

  componentDidMount() {
    this.onNotificationListener()
    this.onNotificationOpenedListener()
    this.getInitialNotification()
  }
  componentWillUnmount() {}

  getToken = async () => {
    //get the messeging token
    const token = await notifications.getToken()
    //you can also call messages.getToken() (does the same thing)
    return token
  }
  getInitialNotification = async () => {
    //get the initial token (triggered when app opens from a closed state)
    const notification = await notifications.getInitialNotification()
    console.log("getInitialNotification", notification)
    return notification
  }

  onNotificationOpenedListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when the application is in the background
    this.removeOnNotificationOpened = notifications.onNotificationOpened(
      notification => {
        console.log("onNotificationOpened", notification)
        //do something with the notification
      }
    )
  }
  
  onNotificationListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when the application is in the forground/runnning
    //for android make sure you manifest is setup - else this wont work
    console.log("Listening to notifications");
    this.removeOnNotification = notifications.onNotification(notification => {
      //do something with the notification
      console.log("onNotification", notification)
    })
  }

  onTokenRefreshListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when a new token is generated for the user
    this.removeonTokenRefresh = messages.onTokenRefresh(token => {
      //do something with the new token
    })
  }
  setBadge = async number => {
    //only works on iOS for now
    return await notifications.setBadge(number)
  }

  getBadge = async () => {
    //only works on iOS for now
    return await notifications.getBadge()
  }

  hasPermission = async () => {
    //only works on iOS
    return await notifications.hasPermission()
  }

  requestPermission = async () => {
    //only works on iOS
    return await notifications.requestPermission()
  }
  componentWillUnmount() {
    //remove the listener on unmount
    if (this.removeOnNotificationOpened) {
      this.removeOnNotificationOpened()
    }
    if (this.removeOnNotification) {
      this.removeOnNotification()
    }

    if (this.removeonTokenRefresh) {
      this.removeonTokenRefresh()
    }
  }

  onTokenButtonPress = async () => {
    const token = await this.getToken()
    console.log("token : ", token)
    this.setState({ token: token })
  }

  onTestHasPermission = async () => {
    const has = await this.hasPermission()
    console.log("Has", has)
    this.setState({ hasPermission: has })
  }
  render() {
    const { token, hasPermission } = this.state

    return (
      <View style={{ flex: 3 }}>
        <View style={{ flex: 1, backgroundColor: "green" }}>
          <TouchableOpacity
            style={{
              backgroundColor: "red",
              flex: 1,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center"
            }}
            onPress={() => this.onTokenButtonPress()}
          >
            <Text>Get Token</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "blue"
          }}
        >
          <Text>Token : {token}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: "pink" }}>
          <Text>hasPermission: {hasPermission ? "Yes" : "No"}</Text>
          <TouchableOpacity
            style={{
              backgroundColor: "red",
              flex: 1,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center"
            }}
            onPress={() => this.onTestHasPermission()}
          >
            <Text>Has permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "red",
              flex: 1,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center"
            }}
            onPress={() => this.requestPermission()}
          >
            <Text>Get permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    )

    return (
      <>
        <View style={{ flex: 1, backgroundColor: "blue" }}>
          <TouchableOpacity
            style={{ backgroundColor: "red" }}
            onPress={() => this.onTokenButtonPress()}
          >
            <Text>Get Token</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{ flex: 1, backgroundColor: "green", width: 100, height: 100 }}
        >
          <Text>Token : {token}</Text>
        </View>
      </>
    )
  }
}


export default RootContainer;
