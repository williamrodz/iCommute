//
//  MainViewController.swift
//  iCommute
//
//  Created by William A. Rodriguez on 3/31/19.
//  Copyright © 2019 GoldenRod. All rights reserved.
//

import UIKit
import UserNotifications

class MainViewController: UIViewController {
    
    // variables
    @IBOutlet weak var originField: UITextField!
    @IBOutlet weak var destinationField: UITextField!
    var savedNotifications:[CommuteNotification] = [];
    let testOrigin:String = "428 Memorial Dr, Cambridge, MA"
    let testDestination:String = "77 Massachusetts Ave, Cambridge, MA"
    
    let GoogleMapsAPIKey = "AIzaSyB65D4XHv6PkqvWJ7C-cFvT1QHi9OkqGCE";
    let GoogleMapsHTTPRequestBase = "https://maps.googleapis.com/maps/api/distancematrix/json?origins";

    
    // https://maps.googleapis.com/maps/api/distancematrix/json?origins=Boston,MA|Charlestown,MA&destinations=Lexington,MA|Concord,MA&departure_time=now&key=AIzaSyB65D4XHv6PkqvWJ7C-cFvT1QHi9OkqGCE

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }
    
    func getRequestURL(origin:String,destination:String) -> URL?{
        var urlComponents = URLComponents(string: "https://maps.googleapis.com/maps/api/distancematrix/json?")
        
        let arguments: [String: String] = [
            "origins": testOrigin,
            "destinations": testDestination,
            "departure_time": "now",
            "key":"AIzaSyB65D4XHv6PkqvWJ7C-cFvT1QHi9OkqGCE"
        ]
        
        var queryItems = [URLQueryItem]()
        
        for (key, value) in arguments {
            queryItems.append(URLQueryItem(name: key, value: value))
        }
        
        urlComponents?.queryItems = queryItems
        
        if let url = urlComponents?.url {
            print(url) //
            return url
        } else{
            return URL(string:"https://www.google.com")
        }
    }
    
    
    func fetchData(completion: @escaping ([String:Any]?, Error?) -> Void) {

        let url = getRequestURL(origin: "test", destination: "test")!;
        
        let task = URLSession.shared.dataTask(with: url) { (data, response, error) in
            guard let data = data else { return }
            do {
                if let array = try JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [String:Any]{
                    completion(array, nil)
                }
            } catch {
                print(error)
                completion(nil, error)
            }
        }
        task.resume()
    }
	/*
	 The following struct definitions are needed to decode JSON response
	*/
	
	struct Distance: Codable {
		let text: String
		let value: Int
	}
	
	struct Duration_in_traffic: Codable {
		let text: String
		let value: Int
	}
	struct Duration: Codable {
		let text: String
		let value: Int
	}
	struct Elements: Codable {
		let distance: Distance
		let duration: Duration
		let duration_in_traffic: Duration_in_traffic
		let status: String
	}
	
	struct Response: Codable {
		let destination_addresses: [String]
		let origin_addresses: [String]
		let rows: [Rows]
		let status: String
	}
	
	struct Rows: Codable {
		let elements: [Elements]
	}
	
	
	
	let sampleJSONString = """
	{
	"destination_addresses" : [ "77 Massachusetts Ave, Cambridge, MA 02142, USA" ],
	"origin_addresses" : [ "428 Memorial Dr, Cambridge, MA 02139, USA" ],
	"rows" : [
	{
	"elements" : [
	{
	"distance" : {
	"text" : "1.8 km",
	"value" : 1754
	},
	"duration" : {
	"text" : "5 mins",
	"value" : 271
	},
	"duration_in_traffic" : {
	"text" : "4 mins",
	"value" : 257
	},
	"status" : "OK"
	}
	]
	}
	],
	"status" : "OK"
	}
	"""
	
	func decodeJSONString(jsonString:String){
		let jsonData = jsonString.data(using: .utf8)!
		let jsonDecoder = JSONDecoder()
		do {
			let response1 = try jsonDecoder.decode(Response.self, from: jsonData)
			let firstRow = response1.rows[0]
			let firstElement = firstRow.elements[0]
			let durationStruct = firstElement.duration
			let durationString = durationStruct.text
		} catch{
			print(error)
		}

	}

	
	

	func fetchMapsData(){
		fetchData { (dict, error) in
			//debugPrint(dict)
			if let rows = dict?["rows"] as? [[String:Any]]{
				print("rows is")
				print(rows)
					
				}
			}
		}
    
    
    @IBAction func calculateCommuteTimeButton(_ sender: UIButton) {
		decodeJSONString(jsonString: sampleJSONString);
		//fetchMapsData();
		//registerLocal();
		//scheduleLocal();

    }
    
    func saveNewNotification(){
        let newNotification = CommuteNotification(origin: originField.text ?? testOrigin,destination: destinationField.text ?? testDestination,departureTime: "3:00PM");
        savedNotifications.append(newNotification);
    }
	
	func registerLocal() {
		let center = UNUserNotificationCenter.current()
		
		center.requestAuthorization(options: [.alert, .badge, .sound]) { (granted, error) in
			if granted {
				print("Yay!")
			} else {
				print("D'oh")
			}
		}
	}
	
	func scheduleLocal() {
		
		let center = UNUserNotificationCenter.current()
		center.removeAllPendingNotificationRequests()
		
		let content = UNMutableNotificationContent()
		content.title = "Late wake up call"
		content.body = "The early bird catches the worm, but the second mouse gets the cheese."
		content.categoryIdentifier = "alarm"
		content.userInfo = ["customData": "fizzbuzz"]
		content.sound = UNNotificationSound.default
		
		var dateComponents = DateComponents()
		dateComponents.hour = 12
		dateComponents.minute = 11
		//let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
		let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)

		
		let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
		center.add(request)
	}
    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}
