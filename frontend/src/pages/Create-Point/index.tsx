import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent } from 'react'
import logo from '../../assets/logo.svg';
import './styles.css'
import { Link,useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import {LeafletMouseEvent} from 'leaflet'
import {Map,TileLayer,Marker} from 'react-leaflet'
import api from '../../services/api';
import axios from 'axios'

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IbgeUf {
  sigla: string;
}

interface IbgeCity{
  nome: string;
}

const CreatePoint: React.FC = () => {
  const history = useHistory()
  const [items,setItems] = useState<Item[]>([])
  const [ufs,setUfs] = useState<string[]>([])
  const [ citys, setCitys] = useState<string[]>([])
  const [selectedUf, setSelectedUf] = useState<string>('0');
  const [selectedCity, setSelectedCity]= useState<string>('0')
  const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0])
  const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0])
  const [selectedItems,setSelectedItems] = useState<number[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })


  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const long = position.coords.longitude;

      setInitialPosition([lat,long])
    })

  },[])
  
  useEffect(()=>{
    api.get('/items').then(response =>{
      setItems(response.data)
    })
  },[])

  useEffect(()=>{
    axios.get<IbgeUf[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla)
      setUfs(ufInitials)
    })
  },[])

  useEffect(()=>{
    if(selectedUf === '0') {
      return
    }

    axios.get<IbgeCity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
      const inicitalcitys = response.data.map(city => city.nome)
      setCitys(inicitalcitys)
    })
  },[selectedUf]) 

  const handleSelect = useCallback((event: ChangeEvent<HTMLSelectElement>)=>{
    setSelectedUf(event.target.value)

  },[])

  const handleSelectedCity = useCallback((event: ChangeEvent<HTMLSelectElement>)=>{
    setSelectedCity(event.target.value)
  },[])

  const handleMapClick = useCallback((event: LeafletMouseEvent)=>{
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])

  },[])

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>)=>{
    const {name,value} = event.target

    setFormData({...formData,[name]: value})
  },[formData])

  const handleSelectItem = useCallback((id)=>{
    if(selectedItems.includes(id)){
      const filteredItems = selectedItems.filter(item => item !== id)
      setSelectedItems(filteredItems)
    } else {
      setSelectedItems([...selectedItems,id])  
    }
    
  },[selectedItems])

  const handleSubmit = useCallback(async (event: FormEvent)=>{
    event.preventDefault();
    const {name,email,whatsapp} = formData;
    const [latitude,longitude] = selectedPosition;
    const city = selectedCity;
    const uf = selectedUf;  
    const items = selectedItems;
    const data = {  
      name,
      email,
      whatsapp,
      uf,
      city,
      longitude,
      latitude,
      items
    }

   await api.post('/points', data)
   alert('ponto criado')
   history.push('/')
  },[formData, history, selectedCity, selectedItems, selectedPosition, selectedUf])

  return (
    <div id="page-create-point">
        <header>
          <img src={logo} alt="Ecoleta"/>
          <Link to='/'>
            <FiArrowLeft/>  
            Voltar para home
          </Link>
        </header>

        <form onSubmit={handleSubmit}>
          <h1>Cadastro do ponto da coleta</h1>

          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>
            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input type="text" name="name" id="name" onChange={handleInputChange}/>
            </div>

            <div className="field-group">
            <div className="field">
              <label htmlFor="email">email</label>
              <input type="text" name="email" id="email"onChange={handleInputChange}/>
            </div>
            <div className="field">
              <label htmlFor="whatsapp">whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
            </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o local no mapa</span>
            </legend>

            <Map center={initialPosition} zoom={17} onClick={handleMapClick} >
              <TileLayer  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
              <Marker position={selectedPosition} />
            </Map>

            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select name="uf" id="uf" onChange={handleSelect} value={selectedUf}>
                  <option value="0">Selecione uma UF</option>
                  {ufs.map(uf => (
                    <option value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select name="city" id="city" onChange={handleSelectedCity} value={selectedCity}>
                  <option value="0">Selecione uma cidade</option>
                  {citys.map(city => (
                    <option value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Itens de coleta</h2>
              <span>Selectione os itens de coleta</span>
            </legend>
            <div>
            <ul className="items-grid">
              {items.map(item => (
                <li key={item.id} 
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected': ''}
                >
                <img src={item.image_url} alt="oleo"/>
                <span>{item.title}</span>   
              </li>
              ))}

              
            </ul>              
            </div>
          </fieldset>

          <button type="submit">Cadastrar</button>
        </form>
    </div>
  )
}

export default CreatePoint;