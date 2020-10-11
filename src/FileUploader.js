import React from 'react';
import axios from 'axios';
import * as tus from "tus-js-client";

const accessToken = 'API_KEY';
const API = 'https://api.vimeo.com/me/videos';
export class FileUploader extends React.Component {
    constructor(props) {
        super(props)

    }

    state = {
        selectedFile: null
    };
    onFileChange = event => {
        console.log('Here in onFileChange');

        this.setState({ selectedFile: event.target.files[0] });
        console.log(event.target.files[0]);
    };

    onFileUpload = () => {
        console.log('Here in button click');
        console.log(API);
        const body = {
            name: this.state.selectedFile.name,
            upload: {
                approach: 'tus',
                size: this.state.selectedFile.size
            }
        };

        axios.post(API, body, {
            headers: {
                'Authorization': `bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.vimeo.*+json;version=3.4'
            }
        }).then(response => {
            console.log(response);//response.data.upload.upload_link
            const { upload_link } = response.data.upload;
            let chunkSizeInMb = 10;
            const tusUpload = new tus.Upload(this.state.selectedFile,
                {
                    uploadUrl: upload_link,
                    endpoint: upload_link,
                    storeFingerprintForResuming: true,
                    removeFingerprintOnSuccess: false,
                    chunkSize: chunkSizeInMb * 1048576,// 67108864,//134217728,//67108864,//134217728,//201326592,//268435456,//536870912,
                    retryDelays: [0, 1000, 3000, 5000, 10000],
                    onError: error => {
                        console.log('Failed: ' + this.state.selectedFile.name + error);
                    },
                    onProgress: (bytesUploaded, bytesTotal) => {
                        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                        console.log(
                            bytesUploaded,
                            bytesTotal,
                            percentage + '%'
                        );
                    },
                    onSuccess: () => {
                        console.log('Download' + this.state.selectedFile.name + 'from' + tusUpload.url);
                        console.log('Videos uploaded successfully');
                    },
                }
            );

            tusUpload.start();
        })

    }
    render() {
        return (
            <div>
                <input type="file" onChange={this.onFileChange} />
                <button onClick={this.onFileUpload}>
                    Upload!
        </button>
            </div>)
    }
}