import React from 'react';
import {
	ActivityIndicator,
	Button,
	Clipboard,
	FlatList,
	Image,
	Share,
	StyleSheet,
	Text,
	ScrollView,
	View
} from 'react-native';
import { ImagePicker, Permissions } from 'expo';
import uuid from 'uuid';
import Environment from './config/environment';
import firebase from './config/firebase';

export default class App extends React.Component {
	state = {
		image: null,
		uploading: false,
		googleResponse: null
	};


	async componentDidMount() {
	    console.disableYellowBox = true;
		await Permissions.askAsync(Permissions.CAMERA_ROLL);
		await Permissions.askAsync(Permissions.CAMERA);
	}

	render() {
		let { image } = this.state;

		return (
			<View style={styles.container}>
				<ScrollView
					style={styles.container}
					contentContainerStyle={styles.contentContainer}
				>
					<View style={styles.getStartedContainer}>
						{image ? null : (
							<Text style={styles.getStartedText}>Google Cloud Vision</Text>
						)}
					</View>

					<View style={styles.helpContainer}>
						<Button
							onPress={this._pickImage}
							title="Alegeti o imagine din Galeria Foto"
						/>

						<Button onPress={this._takePhoto} title="Faceti o fotografie" />
						{this.state.googleResponse &&
							<Text>{this.state.googleResponse}</Text>

						}
						{this._maybeRenderImage()}
						{this._maybeRenderUploadingOverlay()}
					</View>
				</ScrollView>
			</View>
		);
	}

	organize = array => {
		return array.map(function(item, i) {
			return (
				<View key={i}>
					<Text>{item}</Text>
				</View>
			);
		});
	};

	_maybeRenderUploadingOverlay = () => {
		if (this.state.uploading) {
			return (
				<View
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: 'rgba(0,0,0,0.4)',
							alignItems: 'center',
							justifyContent: 'center'
						}
					]}
				>
					<ActivityIndicator color="#fff" animating size="large" />
				</View>
			);
		}
	};

	_maybeRenderImage = () => {
		let { image, googleResponse } = this.state;
		if (!image) {
			return;
		}

		return (
			<View
				style={{
					marginTop: 20,
					width: 350,
					borderRadius: 3,
					elevation: 2
				}}
			>
				<Button
					style={{ marginBottom: 10 }}
					onPress={() => this.submitToGoogle()}
					title="Analizeaza documentul!"
				/>

				<View
					style={{
						borderTopRightRadius: 3,
						borderTopLeftRadius: 3,
						shadowColor: 'rgba(0,0,0,1)',
						shadowOpacity: 0.2,
						shadowOffset: { width: 4, height: 4 },
						shadowRadius: 5,
						overflow: 'hidden'
					}}
				>
					<Image source={{ uri: image }} style={{ width: 350, height: 270 }} />
				</View>
				<Text
					onPress={this._copyToClipboard}
					onLongPress={this._share}
					style={{ paddingVertical: 10, paddingHorizontal: 10 }}
				/>


				{googleResponse && (
					<Text
						onPress={this._copyToClipboard}
						onLongPress={this._share}
						style={{ paddingVertical: 10, paddingHorizontal: 10 }}
					>
					}
					</Text>
				)}
			</View>
		);
	};

	_keyExtractor = (item, index) => item.id;

	_renderItem = item => {
		<Text>response: {JSON.stringify(item)}</Text>;
	};

	_share = () => {
		Share.share({
			message: JSON.stringify(this.state.googleResponse.responses),
			title: 'Check it out',
			url: this.state.image
		});
	};

	_copyToClipboard = () => {
		Clipboard.setString(this.state.image);
		alert('Copied to clipboard');
	};

	_takePhoto = async () => {
	    this.state.googleResponse=null;
		let pickerResult = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3]
		});

		this._handleImagePicked(pickerResult);
	};

	_pickImage = async () => {
		let pickerResult = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [4, 3]
		});

		this._handleImagePicked(pickerResult);
	};

	_handleImagePicked = async pickerResult => {
		try {
			this.setState({ uploading: true });

			if (!pickerResult.cancelled) {
				uploadUrl = await uploadImageAsync(pickerResult.uri);
				this.setState({ image: uploadUrl });
			}
		} catch (e) {
			console.log(e);
			alert('Upload failed, sorry :(');
		} finally {
			this.setState({ uploading: false });
		}
	};

	submitToGoogle = async () => {
		try {
			this.setState({ uploading: true });
			let { image } = this.state;
			let body = JSON.stringify({
				requests: [
					{
						features: [
							{ type: 'LABEL_DETECTION', maxResults: 10 },
							{ type: 'LANDMARK_DETECTION', maxResults: 5 },
							{ type: 'FACE_DETECTION', maxResults: 5 },
							{ type: 'LOGO_DETECTION', maxResults: 5 },
							{ type: 'TEXT_DETECTION', maxResults: 5 },
							{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 5 },
							{ type: 'SAFE_SEARCH_DETECTION', maxResults: 5 },
							{ type: 'IMAGE_PROPERTIES', maxResults: 5 },
							{ type: 'CROP_HINTS', maxResults: 5 },
							{ type: 'WEB_DETECTION', maxResults: 5 }
						],
						image: {
							source: {
								imageUri: image
							}
						}
					}
				]
			});
			let response = await fetch(
				'https://vision.googleapis.com/v1/images:annotate?key=' +
					Environment['GOOGLE_CLOUD_VISION_API_KEY'],
				{
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'POST',
					body: body,
					requests: [
                        {
                           'features': [

                                     {
                                        "type": "FACE_DETECTION",
                                        "maxResults": 50
                                    },
                                      {
                                        "type": "LOGO_DETECTION",
                                        "maxResults": 50
                                    },
                                      {
                                        "type": "LABEL_DETECTION",
                                        "maxResults": 50
                                    },
                                      {
                                        "type": "TEXT_DETECTION",
                                        "maxResults": 50
                                    }

                           ]
                        }
                      ]
				}
			);
			let responseJson = await response.json();
            let allString = responseJson.responses[0].textAnnotations[0].description;



            let regex_buletin = /SERIA\s+(\S\S)\s+NR\s(\d{6})/g;
            buletin = allString.match(regex_buletin);

            let regex_name = /IDROU([^<]*\<+([^<])*)\<+/ ;
            let name = allString.match(regex_name);
            let finalName='';
            if (name){
                name = name[1].replace("<<"," ");
            }
            let regex_address = /(Jud|Mun|Sat)\..*/g;
            let address = allString.match(regex_address);
            if (address){
                address = address[1];
            }
            let regex_str = /(Ale|Str|Bul)\..*/g;
            let street = allString.match(regex_str);
            let loc_eliberare_regex = /SPCLEP\s*(\S+)/;
            let loc_elib = allString.match(loc_eliberare_regex);

            if (loc_elib){
                loc_elib=loc_elib[0];
            }
            let data_elib_regex = /(\d\d.\d\d.\d\d)-(\d\d.\d\d.\d\d\d\d)/;
            let data_elib = allString.match(data_elib_regex);

            if (data_elib){
                data_elib = data_elib[0];
            }
            let cnp_regex = /CNP\s+(\d{13})/;
            let cnp = allString.match(cnp_regex);
            if (cnp){
                cnp = cnp[0];
            }

			console.log(address);
			console.log(street);
			console.log(name);
			console.log(finalName);
			console.log(buletin);


            orc_regex = /J\d\d\/\d\d\d\/\d\d\d\d/;
            orc = allString.match(orc_regex);
            if (orc){
                orc= " ORC: "+orc[0];
            } else{
                orc = "";
            }
            console.log(orc);

            cif_regex = /RO\d\d\d\d\d\d\d/;
            cif = allString.match(cif_regex);
            if (cif){
                cif=cif[0];
            }
            console.log(cif);

            chitanta_regex = /CHITANTA RAMBURS NUMERAR ..*/;
            chitanta = allString.match(chitanta_regex);
            if (chitanta){
                chitanta = chitanta[0];
            } else {
                chitanta_regex = /Factura fiscala ..*/;
                chitanta = allString.match(chitanta_regex);
                if (chitanta){
                    chitanta = chitanta[0];
                }else{
                    chitanta_regex = /BON FISCAL ..*/;
                    chitanta = allString.match(chitanta_regex);
                    if (chitanta){
                        chitanta = chitanta[0];
                    } else {
                     chitanta_regex = /Chitanta ..*/;
                     chitanta = allString.match(chitanta_regex);
                     if (chitanta){
                         chitanta = chitanta[0];
                     }
                    }
                }
            }
            console.log(chitanta);

            suma_regex =/suma de : (\d*.\d*) lei/;
            suma = allString.match(suma_regex);
            if(suma){
                suma= suma[0];
            } else {
                suma_regex = /Total:(  *\d*.\d*)/;
                suma = allString.match(suma_regex);
                if (suma){
                    suma = suma[0];
                } else {
                    suma_regex = /TOTAL=(  *\d*.\d*) LEI/;
                    suma = allString.match(suma_regex);
                    if (suma){
                     suma = suma[0];
                    } else{
                        suma_regex =/suma de (\d*.\d*) lei/;
                        suma = allString.match(suma_regex);
                        if(suma){
                             suma= suma[0];
                        }
                    }
                }
            }
            console.log(suma);

            ramburs_regex = /AWB..*/;
            ramburs = allString.match(ramburs_regex);
            if(ramburs){
                ramburs = ramburs[0];
            }else{
                ramburs_regex = /Awb..*/;
                ramburs = allString.match(ramburs_regex);
                if(ramburs){
                    ramburs = ramburs[0];
                 } else{
                    ramburs_regex = /CURSA NR:..*/;
                    ramburs = allString.match(ramburs_regex);
                    if(ramburs){
                       sofer_regex = /SOFER..*/;
                       sofer = allString.match(sofer_regex);
                       if (sofer){
                            ramburs = ramburs[0] + " cu " + sofer[0];
                       } else {
                            ramburs = ramburs[0];
                       }

                    } else{
                    ramburs = chitanta;
                    }
                }

            }
            console.log(ramburs);

            expeditor_regex = /expeditorul ..*/;
            expeditor = allString.match(expeditor_regex);
            if(expeditor){
                expeditor = expeditor[0];
            } else{
                expeditor='';
            }
            console.log(expeditor);

			let responseFinal = null;
			if (name){
			    responseFinal = "\n\nSubsemnatul(a) "+ name+ " avand " +cnp + ", posesor a Cartii de Identitate "+ buletin+ " emisa de " + loc_elib+ " valabila in perioada "+ data_elib+", domiciliat(a) in "+ address + " " + street+ " solicit montarea in fata casei a unei prize de incarcare masini electrice. \n\nCu consideratie,\n"+name;
			}

			if (orc || cif){
			    responseFinal = "\n\n"+ suma+ " reprezentand "+ ramburs + " este platita catre "+ expeditor+ " "+ orc + " CIF: "+ cif + " conform "+ chitanta;
			}

			this.setState({
				googleResponse: responseFinal,
				uploading: false
			});
		} catch (error) {
			console.log(error);
		}
	};
}

async function uploadImageAsync(uri) {
	const blob = await new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.onload = function() {
			resolve(xhr.response);
		};
		xhr.onerror = function(e) {
			console.log(e);
			reject(new TypeError('Network request failed'));
		};
		xhr.responseType = 'blob';
		xhr.open('GET', uri, true);
		xhr.send(null);
	});

	const ref = firebase
		.storage()
		.ref()
		.child(uuid.v4());
	const snapshot = await ref.put(blob);

	blob.close();

	return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingBottom: 10
	},
	developmentModeText: {
		marginBottom: 20,
		color: 'rgba(0,0,0,0.4)',
		fontSize: 14,
		lineHeight: 19,
		textAlign: 'center'
	},
	contentContainer: {
		paddingTop: 30
	},

	getStartedContainer: {
		alignItems: 'center',
		marginHorizontal: 50
	},

	getStartedText: {
		fontSize: 17,
		color: 'rgba(96,100,109, 1)',
		lineHeight: 24,
		textAlign: 'center'
	},

	helpContainer: {
		marginTop: 15,
		alignItems: 'center'
	}
});