import express, { Request, Response } from 'express'
import cors from 'cors'
import { accounts } from './database'
import { ACCOUNT_TYPE } from './types'
import { resolveSoa } from 'dns'
import { isReadable } from 'stream'

const app = express()

app.use(express.json())
app.use(cors())

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})

app.get("/ping", (req: Request, res: Response) => {
    res.send("Pong!")
})

app.get("/accounts", (req: Request, res: Response) => {
    res.send(accounts)
})

app.get("/accounts/:id", (req: Request, res: Response) => {

    try {

        const id = req.params.id
        const result = accounts.find((account) => account.id === id)

        if (!result) {
            res.status(404)
            throw new Error("Conta não foi encontrada. verifique a 'id'")
        }
        res.status(200).send(result)
    } catch (error: any) {
        console.log(error)
        if (res.statusCode === 200) {
            res.status(500)
        }
        res.send(error.message)
    }
})

app.delete("/accounts/:id", (req: Request, res: Response) => {

    try {

        const id = req.params.id

        if (id[0] !== "a") {
            res.status(400)
            throw new Error("'id' invalido. Deve iniciar com a letra 'a'")
        }

        const accountIndex = accounts.findIndex((account) => account.id === id)

        if (accountIndex >= 0) {
            accounts.splice(accountIndex, 1)
            res.status(200).send("Item deletado com sucesso")
        } else {
            res.status(404).send("Item não existe!")
        }

    } catch (error) {
        console.log(error)
        if (res.statusCode === 200) {
            res.status(500)
        }
        res.send(error.message)
    }



})

app.put("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const newId = req.body.id

        if(newId !== undefined){
            if(newId[0]!=="a"){
                res.status(400)
                throw new Error (" O 'id' deve começar com 'a'")
            }         
        }

        const newOwnerName = req.body.ownerName

        if(newOwnerName !== undefined){
            if(newOwnerName.length < 2 ){
                res.status(400)
                throw new Error ("O 'ownerName' deve conter no minimo dois caracteres!")
            }
        }

        const newBalance = req.body.balance

        if (newBalance !== undefined) {
            if (typeof newBalance !== "number") {
                res.status(400)
                throw new Error("'Balance' deve ser do tipo number");
            }

            if (newBalance < 0) {
                res.status(400)
                throw new Error("'balance' não pode ser negativo")
            }
        }

        const newType = req.body.type

        if (newType !== undefined) {
            if (
                newType !== ACCOUNT_TYPE.GOLD &&
                newType !== ACCOUNT_TYPE.PLATINUM &&
                newType !== ACCOUNT_TYPE.BLACK
            ) {
                res.status(400)
                throw new Error("'type' deve ter um tipo válido: GOLD, PLATINUM ou BLACK")
            }
        }

        const account = accounts.find((account) => account.id === id)

        if (account) {

            account.id = newId || account.id
            account.ownerName = newOwnerName || account.ownerName
            account.type = newType || account.type

            account.balance = isNaN(newBalance) ? account.balance : newBalance
        }

        res.status(200).send("Atualização realizada com sucesso")
    } catch (error) {

        console.log(error)
        if (res.statusCode === 200) {
            res.status(500)
        }
        res.send(error.message)

    }
})
// Para fixar, agora é sua vez de implementar as seguintes validações:
// req.body.id (newId)
// string que inicia com a letra ‘a’

// req.body.ownerName (newOwnerName)
// string com no mínimo 2 caracteres
