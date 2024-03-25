//  (this will be your data layer)
const pg = require('pg');
const uuid = require('uuid');
const client = new pg.Client(
    process.env.DATABASE_URL || 'postgres://localhost/the_acme_store'
);

    const initTables = async () => {
        await client.connect()
        console.log('connected to database');
        let SQL = /* sql */ `
        DROP TABLE IF EXISTS product;
        DROP TABLE IF EXISTS user;
        DROP TABLE IF EXISTS favorite;
    
        CREATE TABLE products(
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE users(
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL
        );
        CREATE TABLE user_favorite(
            id UUID PRIMARY KEY,
            product_id UUID REFERENCES products(id) NOT NULL,
            user_id UUID REFERENCES users(id) NOT NULL
        );
        `
        await client.query(SQL);
    }

const createProduct = async (name) => {
    const SQL = /*SQL*/ `INSERT INTO users(id, name) VALUES($1, $2) RETURNING *`;
    const { rows } = await client.query(SQL, [uuid.v4(), name]);
    return rows[0];
}

const createUser = async (name) => {
    const SQL = /* sql */ `INSERT INTO users(id, name) VALUES($1, $2) RETURNING *`;
    const { rows } = await client.query(SQL, [uuid.v4(), name]);
    return rows[0];
}

const createFavorite = async ({product_id, user_id}) => {
    const SQL = /*SQL*/ `
      INSERT INTO favorites(id, product_id, user_id) VALUES($1, $2, $3, $4) RETURNING *;
    `;
    const { rows } = await client.query(SQL, [uuid.v4(), product_id, user_id]);
    return rows;
  }

  const fetchProducts = async () => {
    const SQL = /*SQL*/ `SELECT * from products`
    const { rows } = await client.query(SQL);
    return rows;
  }
  const fetchUsers = async () => {
    const SQL = /*SQL*/ `SELECT * from users`
    const { rows } = await client.query(SQL);
    return rows;
  }
  const fetchFavorites = async () => {
    const SQL = /*SQL*/ `SELECT * from favorites`
    const { rows } = await client.query(SQL);
    return rows;
  }
  
  const destroyFavorite =  async ({id, user_id}) => { 
    const SQL = /*SQL*/ `DELETE FROM user_favorite WHERE id=$1 AND user_id=$2 RETURNING *`
    await client.query(SQL, [id, user_id])
  }

const seed = async () => {
    await Promise.all([
        createProduct({name: 'Tissue Box'}),
        createProduct({name: 'Keyboard'}),
        createProduct({name: 'Binder'}),
        createProduct({name: 'Mirror'}),
        createUser({name: 'Dylan'}),
        createUser({name: 'Jennifer'}),
        createUser({name: 'Tom'}),
        createUser({name: 'Michael'}),
    ]);

    console.log('Customers created: ', await fetchProducts());
    const customer = await fetchProducts();
    console.log('Restaurants created: ', await fetchUsers());
    const restaurant = await fetchUsers();

    await Promise.all([
        createFavorite({
            user_id: users[0].id,
            product_id: product[3].id,
        }),
        createFavorite({
            user_id: users[1].id,
            product_id: product[2].id,
        }),
        createFavorite({
            user_id: users[2].id,
            product_id: product[1].id,
        }),
        createFavorite({
            user_id: users[3].id,
            product_id: product[0].id,
        }),
      ])
      console.log("Favorites created: ", await fetchFavorites())
    }

module.exports = {
    client,
    initTables,
    createProduct,
    createUser,
    createFavorite,
    fetchProducts,
    fetchUsers,
    fetchFavorites,
    destroyFavorite,
    seed
}