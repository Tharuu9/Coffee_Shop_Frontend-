import {GrUpload} from "react-icons/gr";
import CustomInput from "../../input/customInput.tsx";
import {forwardRef, useImperativeHandle, useReducer, useRef, useState} from "react";
import * as validator from "../../../util/validator.ts";
import axios from "axios";
// @ts-ignore
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import Swal from "sweetalert2";

interface Data {
    _id: string;
    name: string;
    desc: string;
    size: number;
    price: number;
    qty: number;
    image: string;
}

interface FormState {

    dessertId: string;
    dessertIdError: string | null;

    dessertName: string;
    dessertNameError: string | null;

    description: string;
    descriptionError: string | null;

    size: number | string;
    sizeError: string | null;

    price: number | string;
    priceError: string | null;

    qty: number | string;
    qtyError: string | null;
}

interface FormFieldSetAction {
    formFieldName: string;
    formFieldValue: string | number;
}

const formFieldSetReducer = (state: FormState, action: FormFieldSetAction): FormState => {

    switch (action.formFieldName) {

        case "DessertId": {
            return {
                ...state,
                dessertId: String(action.formFieldValue),
                dessertIdError: null
            };
        }

        case "Dessert": {
            return {
                ...state,
                dessertName: String(action.formFieldValue),
                dessertNameError: validator.validateItemName(String(action.formFieldValue))
            };
        }
        case "Desc": {
            return {
                ...state,
                description: String(action.formFieldValue),
                descriptionError: validator.validateDes(String(action.formFieldValue))
            };
        }
        case "Size": {
            return {
                ...state,
                size: action.formFieldValue,
                sizeError: validator.validateNumber(+action.formFieldValue)
            };
        }
        case "Price": {
            return {
                ...state,
                price: action.formFieldValue,
                priceError: validator.validateNumber(+action.formFieldValue)
            };
        }
        case "Qty": {
            return {
                ...state,
                qty: action.formFieldValue,
                qtyError: validator.validateNumber(+action.formFieldValue)
            };
        }
        default: {
            return state;
        }
    }
};

interface Props {
    onLoadAction: () => void;
    onSetDessert: (dessert: Data) => void;
    showTosty: (title: string, message: string) => void;
}

const AddDessert = forwardRef((props: Props, ref): JSX.Element => {

    const [dessertImg, setDessertImg] = useState<any>('');
    const [oldDessertImg, setOldDessertImg] = useState<string>('');
    const fileInputRef = useRef<any>();
    const [dessertState, setDessertState] = useState<'Add' | 'Update'>("Add");
    const navigate = useNavigate();

    useImperativeHandle(ref, () => {
        return {
            setDessert: (dessert: Data) => {
                setDessertState("Update");
                dispatch({formFieldName: "DessertId", formFieldValue: dessert._id});
                dispatch({formFieldName: "Dessert", formFieldValue: dessert.name});
                dispatch({formFieldName: "Desc", formFieldValue: dessert.desc});
                dispatch({formFieldName: "Size", formFieldValue: dessert.size});
                dispatch({formFieldName: "Price", formFieldValue: dessert.price});
                dispatch({formFieldName: "Qty", formFieldValue: dessert.qty});
                setOldDessertImg(`http://localhost:8080/images/${dessert.image}`);
                setDessertImg('')
            },
        };
    });

    const handleClick = (): void => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: any) => {
        setDessertImg(event.target.files[0]);
    };

    const getToken = (): string | null => {
        const token = Cookies.get('token');
        if (!token) {
            Swal.fire({
                title: "Login expire !",
                text: "Please log in to continue!",
                showCancelButton: false,
                confirmButtonText: "OK!",
                customClass: {
                    title: 'swal-title',
                    popup: 'swal-popup',
                    confirmButton: 'swal-confirm',
                    cancelButton: 'swal-cancel'
                }
            });
            navigate('/login');
            return null;
        } else {
            return token;
        }
    }

    const [state, dispatch] = useReducer<(state: FormState, action: FormFieldSetAction) => FormState>(
        formFieldSetReducer,
        {

            dessertId: '',
            dessertIdError: null,

            dessertName: '',
            dessertNameError: null,

            description: '',
            descriptionError: null,

            size: '',
            sizeError: null,

            price: '',
            priceError: null,

            qty: '',
            qtyError: null
        }
    );

    const handleAddDessert = () => {

        if (dessertImg === null || dessertImg === '') {
            props.showTosty('Warning', 'Image cannot be empty')
            return;
        }

        const token = getToken();
        if (token === null)
            return;

        const config = {
            headers: {
                'Authorization': token,
                'Content-Type': 'multipart/form-data',
            }
        };

        let dessertData = JSON.stringify({
            name: state.dessertName,
            desc: state.description,
            size: state.size,
            price:state.price,
            qty: state.qty
        });

        const formData = new FormData();

        // @ts-ignore
        formData.append('file', dessertImg);
        formData.append('dessert', dessertData);

        axios.post('http://localhost:8080/dessert', formData, config)
            .then(res => {
                clearAll();
                props.onLoadAction();
                props.showTosty('Success', res.data.message);

            })
            .catch(err => {
                console.log(err)
                props.showTosty('Error', err.response.data.message);
            });
    }

    const handleUpdateDessert = () => {

        const token = getToken();
        if (token === null)
            return;

        const config = {
            headers: {
                'Authorization': token,
                'Content-Type': 'multipart/form-data',
            }
        };
        let dessertData = JSON.stringify({
            _id: state.dessertId,
            name: state.dessertName,
            desc: state.description,
            size: state.size,
            price:state.price,
            qty: state.qty
        });

        const formData = new FormData();

        formData.append('file', dessertImg);
        formData.append('dessert', dessertData);

        axios.put('http://localhost:8080/dessert', formData, config)
            .then(res => {
                clearAll();
                props.onLoadAction();
                props.showTosty('Success', res.data.message);
            })
            .catch(err => {
                console.log(err)
                props.showTosty('Error', err.response.data.message);
            });
    }

    const handleUpdateDessertWithoutImg = () => {

        const token = getToken();
        if (token === null)
            return;

        const config = {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            }
        };

        let coffeeData = JSON.stringify({
            _id: state.dessertId,
            name: state.dessertName,
            desc: state.description,
            size: state.size,
            price:state.price,
            qty: state.qty
        });

        axios.put('http://localhost:8080/dessert/withoutImage', coffeeData, config)
            .then(res => {
                clearAll();
                props.onLoadAction();
                props.showTosty('Success', res.data.message);
            })
            .catch(err => {
                console.log(err)
                props.showTosty('Error', err.response.data.message);
            });
    }

    const handleValidation = () => {

        if (state.dessertName === null || state.dessertName === '') {
            props.showTosty('Warning', 'Name cannot be empty')
            return;
        }
        if (state.description === null || state.description === '') {
            props.showTosty('Warning', 'Description cannot be empty')
            return;
        }
        if (state.size === null || state.size === '') {
            props.showTosty('Warning', 'Size cannot be empty')
            return;
        }
        if (state.price === null || state.price === '') {
            props.showTosty('Warning', 'Price cannot be empty')
            return;
        }
        if (state.qty === null || state.qty === '') {
            props.showTosty('Warning', 'Quantity cannot be empty')
            return;
        }
        if (dessertState === "Add") {
            handleAddDessert();
        } else {
            if (dessertImg) {
                handleUpdateDessert();
            } else {
                handleUpdateDessertWithoutImg();
            }
        }
    }

    const clearAll = () => {

        dispatch({formFieldName: "DessertId", formFieldValue: ''});
        dispatch({formFieldName: "Dessert", formFieldValue: ''});
        dispatch({formFieldName: "Desc", formFieldValue: ''});
        dispatch({formFieldName: "Size", formFieldValue: ''});
        dispatch({formFieldName: "Price", formFieldValue: ''});
        dispatch({formFieldName: "Qty", formFieldValue: ''});
        setDessertImg('');
        setOldDessertImg('');
        setDessertState("Add");
    }

    return (
        <section className={'w-full px-2 pt-1'}>
            <div className={'w-full h-[20vh] my-3'}>
                <input type={'file'} className={'hidden'} ref={fileInputRef} onChange={handleFileChange}/>
                {
                    dessertImg || oldDessertImg ?
                        <img src={!dessertImg ? oldDessertImg : URL.createObjectURL(dessertImg)} onClick={handleClick}
                             title={'coffee-img'}
                             alt={'coffee-img'} className={'object-cover w-full h-full rounded-xl'}/> :
                        <div onClick={handleClick}
                             className={'w-full h-full border-dashed border-[2px] border-[#ffcaa9] rounded-xl ' +
                                 'flex justify-center items-center flex-col cursor-pointer'}>
                            <h1 className={'font-round text-gray-400 text-[12px] m-2'}>Click for Upload</h1>
                            <GrUpload className={'text-gray-400 text-xl'}/>
                        </div>
                }

            </div>
            <div className={'w-full'}>

                <CustomInput
                    value={state.dessertName}
                    type={'text'}
                    name={'Dessert'}
                    placeholder={'Cheesecake...'}
                    callBack={(value, name) => dispatch({formFieldName: name, formFieldValue: value})}/>

                <CustomInput
                    value={state.description}
                    type={'text'}
                    name={'Desc'}
                    placeholder={'Description for flavours.. '}
                    callBack={(value, name) => dispatch({formFieldName: name, formFieldValue: value})}/>

                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <CustomInput
                            value={state.size}
                            type={'number'}
                            name={'Size'}
                            placeholder={'100g'}
                            callBack={(value, name) => dispatch({formFieldName: name, formFieldValue: value})}/>
                    </div>
                    <div className={'col-md-6'}>
                        <CustomInput
                            value={state.price}
                            type={'number'}
                            name={'Price'}
                            placeholder={'00.00'}
                            callBack={(value, name) => dispatch({formFieldName: name, formFieldValue: value})}/>
                    </div>
                </div>
                <CustomInput
                    value={state.qty}
                    type={'number'}
                    name={'Qty'}
                    placeholder={'10'}
                    callBack={(value, name) => dispatch({formFieldName: name, formFieldValue: value})}/>

                <div className={'w-full flex items-center justify-content-evenly py-4 font-cde text-[13px]'}>
                    <button
                        onClick={() => clearAll()}
                        className={`py-2 w-28 transition-all duration-200 hover: active:text-white active:bg-gray-700 hover:bg-gray-300 bg-gray-200 text-gray-500 rounded`}>Dismiss All
                    </button>
                    <button
                        onClick={handleValidation}
                        className={`py-2 w-28 transition-all duration-200 bg-[#454545] rounded hover:bg-[#2c2c2c] hover:text-white text-white active:bg-[#fc4f13]`}>{dessertState}
                    </button>
                </div>
            </div>
        </section>
    );
});

export default AddDessert;
