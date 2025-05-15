def main():
    import pandas as pd
    from requests import post

    entradas = pd.read_excel('stock_control_backend/setup/transactions.xlsx', sheet_name='entradas')
    
    r = post('http://localhost:8000/api/token/', data={"username": "jpafarelli", "password": "0pr3SS@0"})
    
    access_token = r.json()['access']
    # refresh_token = r.json()['refresh']

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    for index, row in entradas.iterrows():
        # if index < 336:
        #     print(f'index: {index}')
        #     continue

        

        data = row.to_dict()
        data['dataEntrada'] = data['dataEntrada'].strftime('%Y-%m-%d')
        # data['horaEntrada'] = data['horaEntrada'].strftime('%H:%M:%S')
        # if index == 336:
        #     data['codSku'] = 'Adk F100'

        r = post('http://localhost:8000/api/v1/entradas/', headers=headers, json=data)

        print(r.raise_for_status())
        
    pass


if __name__ == "__main__":
    main()
