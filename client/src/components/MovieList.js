import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { SelectButton } from 'primereact/selectbutton';
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import { Calendar } from 'primereact/calendar';
import { SERVER } from '../config/global'

import { getMovies, addMovie, saveMovie, deleteMovie } from '../actions'

const movieSelector = state => state.movie.movieList
const movieCountSelector = state => state.movie.count

function MovieList () {
  const [isDialogShown, setIsDialogShown] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [filterString, setFilterString] = useState('')
  

  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState(1)

  const [filters, setFilters] = useState({
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    category: { value: null, matchMode: FilterMatchMode.CONTAINS }
  })
  const [page, setPage] = useState(0)
  const [first, setFirst] = useState(0)

  const handleFilter = (evt) => {
    const oldFilters = filters
    oldFilters[evt.field] = evt.constraints.constraints[0]
    setFilters({ ...oldFilters })
  }

  const handleFilterClear = (evt) => {
    setFilters({
      title: { value: null, matchMode: FilterMatchMode.CONTAINS },
      category: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })
  }

  useEffect(() => {
    const keys = Object.keys(filters)
    const computedFilterString = keys.map(e => {
      return {
        key: e,
        value: filters[e].value
      }
    }).filter(e => e.value).map(e => `${e.key}=${e.value}`).join('&')
    setFilterString(computedFilterString)
  }, [filters])

  const movies = useSelector(movieSelector)
  const count = useSelector(movieCountSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getMovies(filterString, page, 2, sortField, sortOrder))
  }, [filterString, page, sortField, sortOrder])

  //for crewmembers
  const [crewmembers, setCrewmember] = useState([]);

  const loadCrewmembers = async (id) => {
    const response = await fetch(`${SERVER}/movies/${id}/crewmembers`)
    if(response.status === 200){
        setCrewmember(await response.json());
    }
}
useEffect(() => loadCrewmembers(), []);
 


  const handleAddClick = (evt) => {
    setIsDialogShown(true)
    setIsNewRecord(true)
    setTitle('')
    setCategory('')
  }

  const hideDialog = () => {
    setIsDialogShown(false)
  }

  const handleSaveClick = () => {
    if (isNewRecord) {
      dispatch(addMovie({ title, category, date }))
    } else {
      dispatch(saveMovie(selectedMovie, { title, category, date }))
    }
    setIsDialogShown(false)
    setSelectedMovie(null)
    setTitle('')
    setCategory('')
    setDate('')
  }

  const editMovie = (rowData) => {
    setSelectedMovie(rowData.id)
    setTitle(rowData.title)
    setCategory(rowData.category)
    setIsDialogShown(true)
    setIsNewRecord(false)
  }

  const handleDeleteMovie = (rowData) => {
    dispatch(deleteMovie(rowData.id))
  }

  const tableFooter = (
    <div>
      <Button label='Add' icon='pi pi-plus' onClick={handleAddClick} />
    </div>
  )

  const dialogFooter = (
    <div>
      <Button label='Save' icon='pi pi-save' onClick={handleSaveClick} />
    </div>
  )

  const handleShowCrewmembers = (rowData) => {

    loadCrewmembers(rowData.id)
    console.log(crewmembers);
    console.log(movies);
  }

  const opsColumn = (rowData) => {
    return (
      <>
        <Button label='Edit' icon='pi pi-pencil' onClick={() => editMovie(rowData)} />
        <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={() => handleDeleteMovie(rowData)} />
        <Button label='Show Crew Members'  onClick={() => handleShowCrewmembers(rowData)} />
      </>
    )
  }

  const handlePageChange = (evt) => {
    setPage(evt.page)
    setFirst(evt.page * 2)
  }

  const handleSort = (evt) => {
    console.warn(evt)
    setSortField(evt.sortField)
    setSortOrder(evt.sortOrder)
  }

  const categorySelectItems = [
    {label: 'comedy', value: 'comedy'},
    {label: 'horror', value: 'horror'},
    {label: 'drama', value: 'drama'},
   
];


async function Export(){
  const response = await fetch(`${SERVER}/`)
  const data = await response.json()
  const fileName = "file";
  const json = JSON.stringify(data);
  const blob = new Blob([json],{type:'application/json'});
  const href = await URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName + ".json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

 

  return (
    <div>
      
      <p className='title'>Movies & Crew Members - examen TW</p>
     <div className='master-detail-grid'>
      <DataTable
        value={movies}
        footer={tableFooter}
        lazy

        paginator
        onPage={handlePageChange}
        first={first}
        rows={2}
        totalRecords={count}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
      >
        <Column header='Title' field='title' filter filterField='title' filterPlaceholder='filter by title' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
        <Column header='Category' field='category' filter filterField='category' filterPlaceholder='filter by category' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
        <Column header='Date' field='date' sortable />
        <Column body={opsColumn} />
      </DataTable>
      <Dialog header='A movie' visible={isDialogShown} onHide={hideDialog} footer={dialogFooter}>
        <div>
          <InputText placeholder='title' onChange={(evt) => setTitle(evt.target.value)} value={title} />
        </div>
        <div>
         
        <SelectButton  options={categorySelectItems} onChange={(e) => setCategory(e.value)}></SelectButton>
        </div>
        <div>
        <Calendar placeholder={date} dateFormat="dd/mm/yy" value={date} onChange={(e) => setDate(e.value)}></Calendar>
        </div>
      </Dialog>

      <div>
      <DataTable
        value={crewmembers}
        lazy
       
      >
        <Column header='Name' field='name'  />
        <Column header='role' field='role'  />
       
        
      </DataTable>
      </div>

</div>
<div className='ie'>
  <br>
  </br>
  <br>
  </br>
  <br>
  </br>
  <br>
  </br>
  <br>
  </br>

<Button label='Export'  onClick={() => Export()} />


</div>

    </div>
    
    
  )
}

export default MovieList
