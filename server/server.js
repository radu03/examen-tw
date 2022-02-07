const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const cors = require('cors')
const path = require('path')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
  
})

const Movie = sequelize.define('movie', {
  id:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: Sequelize.STRING,
  category: Sequelize.ENUM('horror','comedy','drama'),
  date: Sequelize.DATE
})

const Crewmember = sequelize.define('crewmember', {
  id:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {type:Sequelize.STRING,
    validate:{
      len:{
        args:[3,45],
        msg: "Minimum 3 characters required"
      }
    }

  },
  role: {type: Sequelize.STRING,
  allowNull: false,
  validate: {
  isIn: [['WRITER', 'DIRECTOR']]
   }},
})

Movie.hasMany(Crewmember)

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname,'build')))


app.get('/sync', async (req, res) => {
  try {
    await sequelize.sync({ force: true })
    res.status(201).json({ message: 'created' })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.get('/movies', async (req, res) => {
  try {
    const query = {}
    let pageSize = 2
    const allowedFilters = ['title', 'category']
    const filterKeys = Object.keys(req.query).filter(e => allowedFilters.indexOf(e) !== -1)
    if (filterKeys.length > 0) {
      query.where = {}
      for (const key of filterKeys) {
        query.where[key] = {
          [Op.like]: `%${req.query[key]}%`
        }
      }
    }

    const sortField = req.query.sortField
    let sortOrder = 'ASC'
    if (req.query.sortOrder && req.query.sortOrder === '-1') {
      sortOrder = 'DESC'
    }

    if (req.query.pageSize) {
      pageSize = parseInt(req.query.pageSize)
    }

    if (sortField) {
      query.order = [[sortField, sortOrder]]
    }

    if (!isNaN(parseInt(req.query.page))) {
      query.limit = pageSize
      query.offset = pageSize * parseInt(req.query.page)
    }

    const records = await Movie.findAll(query)
    const count = await Movie.count()
    res.status(200).json({ records, count })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post('/movies', async (req, res) => {
  try {
    if (req.query.bulk && req.query.bulk === 'on') {
      await Movie.bulkCreate(req.body)
      res.status(201).json({ message: 'created' })
    } else {
      await Movie.create(req.body)
      res.status(201).json({ message: 'created' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.get('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id)
    if (movie) {
      res.status(200).json(movie)
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.put('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id)
    if (movie) {
      await movie.update(req.body, { fields: ['title', 'category', 'date'] })
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.delete('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, { include: Crewmember })
    if (movie) {
      await movie.destroy()
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.get('/movies/:mid/crewmembers', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.mid)
    if (movie) {
      const crewmembers = await movie.getCrewmembers()

      res.status(200).json(crewmembers)
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.get('/movies/:mid/crewmembers/:cid', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.mid)
    if (movie) {
      const crewmembers = await movie.getCrewmembers({ where: { id: req.params.cid } })
      res.status(200).json(crewmembers.shift())
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post('/movies/:mid/crewmembers', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.mid)
    if (movie) {
      const crewmember = req.body
      crewmember.movieId = movie.id
      console.warn(crewmember)
      await Crewmember.create(crewmember)
      res.status(201).json({ message: 'created' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.put('/movies/:mid/crewmembers/:cid', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.mid)
    if (movie) {
      const crewmembers = await movie.getCrewmembers({ where: { id: req.params.cid } })
      const crewmember = crewmembers.shift()
      if (crewmember) {
        await crewmember.update(req.body)
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.delete('/movies/:mid/crewmembers/:cid', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.mid)
    if (movie) {
      const crewmembers = await movie.getCrewmembers({ where: { id: req.params.cid } })
      const crewmember = crewmembers.shift()
      if (crewmember) {
        await crewmember.destroy(req.body)
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})


app.get('/', async (request, response) => {
  try {
    const result = [];
    for (let p of await Movie.findAll()) {
      const movie = {
        title: p.title,
        category: p.category,
        date: p.date,
        crewmembers: []
      };
      for (let s of await p.getCrewmembers()) {
        movie.crewmembers.push({
         
          name: s.name,
          role: s.role,
        });
      }
      result.push(movie);
    }
    if (result.length > 0) {
      response.json(result);
    } else {
      response.sendStatus(204); //no content
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
});


app.post('/', async (request, response) => {
  try {
    const registry = {};
    for (let m of request.body) {
      const movie = await Movie.create(m);
      for (let c of m.crewmembers) {
        const crewmember = await Crewmember.create(c);
        registry[c.key] = crewmember;
        movie.addCrewmember(crewmember);
      }
      await movie.save();
    }
    response.sendStatus(204);
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
});

app.listen(process.env.PORT)
