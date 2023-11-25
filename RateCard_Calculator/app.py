from urllib import response
from flask import Flask, redirect, render_template, url_for, request, session,jsonify,make_response
import json
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS, cross_origin
from sqlalchemy import create_engine, MetaData,Table,Column,Integer,String,ForeignKey,Float,DateTime,VARCHAR

app = Flask(__name__)
CORS(app,resources={r'/*':{'origins':'http://localhost:4200/'}})
engine=create_engine ('mysql://root:123456@localhost/desired_billrate',echo=True)
meta= MetaData()
db = SQLAlchemy(app)

desired_billrate_user_input= Table(
    'desired_billrate_user_input' ,meta,
     Column('id', Integer, primary_key = True,autoincrement=True),
     Column('emp_name',String(80)),
     Column('ctc', Integer),
     Column('markup', Integer),
     Column('t_hours',Integer),
     Column('date_time',String(80)),
     Column('currency_type',String(80))
)     

desired_billrate_inr= Table(
    'desired_billrate_inr',meta,
     Column('id', Integer, primary_key = True,autoincrement=True),
     Column('employee_id',Integer,ForeignKey('desired_billrate_user_input.id')),
     Column('ctc_per_annum',Integer),
     Column('ctc_per_month',Float),
     Column('ctc_per_hour',Float),
     Column('total_base_cost_per_month',Float),
     Column('total_base_cost_per_hour',Float),
     Column('markup_per_month',Float),
     Column('markup_per_hour',Float),
     Column('recommended_billrate_per_month',Float),
     Column('recommended_billrate_per_hour',Float),
     Column('Operation_cost_per_hour',Float)
)

desired_billrate_usd= Table(
    'desired_billrate_usd', meta,
    Column('id', Integer, primary_key = True,autoincrement=True),
    Column('employee_id',Integer,ForeignKey('desired_billrate_user_input.id')),    
     Column('ctc_per_annum',Integer),
     Column('ctc_per_month',Float),
     Column('ctc_per_hour',Float),
     Column('total_base_cost_per_month',Float),
     Column('total_base_cost_per_hour',Float),
     Column('markup_per_month',Float),
     Column('markup_per_hour',Float),
     Column('recommended_billrate_per_month',Float),
     Column('recommended_billrate_per_hour',Float),
     Column('Operation_cost_per_hour',Float),
)  

admin= Table(
    'admin' ,meta,
     Column('id', Integer, primary_key = True,autoincrement=True),
     Column('username',VARCHAR(100)),
     Column('password', VARCHAR(100)),
     Column('c_password', VARCHAR(100)),
     Column('email', VARCHAR(100)),
     Column('role',String(100)),
     Column('roleStatus',String(100)),
     Column('createDateTime',String(100)),
     Column('approvedDateTime',String(100))
)

currency_values= Table(
    'currency_values' ,meta,
     Column('id', Integer, primary_key = True,autoincrement=True),
     Column('ConversionType',VARCHAR(100)),
     Column('ConversionValue',Integer),
)

operation_cost= Table(
    'operation_cost' ,meta,
     Column('id', Integer, primary_key = True,autoincrement=True),
     Column('CurrencyType',VARCHAR(100)),
     Column('OperationCost_Value',Integer)
)

employees= Table(
      'employees' ,meta,
      Column('id',Integer,primary_key = True,autoincrement=True),
      Column('employee_name',String(150))
)

conn=engine.connect()

def create_table():
    meta.create_all(engine)

# create_table()
#To create table

cors = CORS(app,resources={r'/*':{'origins':'http://localhost:4200/'}})
@app.route('/')
@cross_origin(origin='localhost',headers=['Content- Type'])
def home():
    return "RATE CARD CALCULATOR"

@app.route('/getUserInputs', methods=['GET'])
@cross_origin(origin='localhost', headers=['Content-Type'])
def getUserInputs():
    stmt = desired_billrate_user_input.select().order_by(desired_billrate_user_input.c.id)
    res = conn.execute(stmt).fetchall()
    response = jsonify([dict(row) for row in res])
    response.status_code = 200
    return response

@app.post('/postUserInputs')
@cross_origin(origin='localhost',headers=['Content- Type'])
def postUserInputs():
    json = request.json
    id = None
    emp_name = json['emp_name']
    ctc = json['ctc']
    markup = json['markup']
    t_hours = json['t_hours']
    date_time = json['Current_time']
    currency_type=json['Type_of_Currency']
    prices = (id,emp_name,ctc,markup,t_hours,date_time, currency_type)
    stmt = desired_billrate_user_input.insert().values(prices)
    conn.execute(stmt)
    response = jsonify("success",id,emp_name,ctc,markup,t_hours)
    response.status_code = 200
    return response

@app.delete('/deleteUserInputs/<int:id>')
@cross_origin(origin='localhost',headers=['Content- Type'])
def deleteUserInputs(id):
    stmt = desired_billrate_user_input.delete().where(desired_billrate_user_input.c.id == id)
    conn.execute(stmt)
    response = jsonify({'message': f'Successfully deleted row with id={id}'})
    response.status_code = 200
    return response

from sqlalchemy.orm import sessionmaker          
Session = sessionmaker(bind=engine)
session = Session()   
@app.route('/getEmployeeId', methods=['GET'])
@cross_origin(origin='localhost',headers=['Content- Type'])
def getEmployeeId():
   stmt = desired_billrate_user_input.select().order_by(desired_billrate_user_input.c.id.desc()).limit(1)
   res = conn.execute(stmt).fetchall()
   response = jsonify(res[0].id)
   response.status_code = 200
   return response

@app.route('/getemployees', methods=['GET'])
@cross_origin(origin='localhost', headers=['Content-Type'])
def getEmployees():
    stmt = employees.select()
    res = conn.execute(stmt).fetchall()
    employees_list = []
    for r in res:
        employee = {
            'id': r.id,
            'employee_name': r.employee_name
        }
        employees_list.append(employee)
    response = jsonify(employees_list)
    response.status_code = 200
    return response

@app.post('/postemployees')
@cross_origin(origin='localhost',headers=['Content- Type'])
def postEmployees():
    json = request.json
    id= None
    employee_name = json['employee_name']
    emp = (id,employee_name)
    new_employee = employees.insert().values(emp)
    conn.execute(new_employee)
    response = jsonify({'message': 'Employee added successfully'})
    response.status_code = 200
    return response

@app.route('/rupee', methods=['GET','POST'])
@cross_origin(origin='localhost',headers=['Content- Type'])
def postINR():     
    json = request.json
    id = None
    employee_Id = json['employee_Id'],
    ctc_per_Annum = json['ctc_per_Annum'],
    ctc_per_Month= json['ctc_per_Month'],
    ctc_per_Hour= json['ctc_per_Hour'],
    total_basecost_per_Month = json['total_basecost_per_Month'],
    total_basecost_per_Hour = json['total_basecost_per_Hour'],
    markup_per_Month = json['markup_per_Month'],
    markup_per_Hour = json['markup_per_Hour'],
    recommended_billrate_per_Month = json['recommended_billrate_per_Month'],
    recommended_billrate_per_Hour = json['recommended_billrate_per_Hour'],
    operation_cost_per_Hour = json['operation_cost_per_Hour']
    rupees = ( id,employee_Id, ctc_per_Annum,  ctc_per_Month, ctc_per_Hour, total_basecost_per_Month, total_basecost_per_Hour, markup_per_Month, markup_per_Hour, recommended_billrate_per_Month, recommended_billrate_per_Hour,operation_cost_per_Hour )
    stmt=desired_billrate_inr.insert().values(rupees)
    conn.execute(stmt)
    response = jsonify("success",id,employee_Id, ctc_per_Annum,ctc_per_Month,ctc_per_Hour, total_basecost_per_Month,total_basecost_per_Hour,markup_per_Month,markup_per_Hour,recommended_billrate_per_Month,recommended_billrate_per_Hour,operation_cost_per_Hour)
    response.status_code = 200
    return response          

@app.route('/usdollar', methods=['GET','POST'])
@cross_origin(origin='localhost',headers=['Content- Type'])
def postUSD():  
    json = request.json 
    id = None
    employee_Id = json['employee_Id'],
    ctc_per_Annum = json['ctc_per_Annum'],
    ctc_per_Month= json['ctc_per_Month'],
    ctc_per_Hour= json['ctc_per_Hour'],
    total_basecost_per_Month = json['total_basecost_per_Month'],
    total_basecost_per_Hour = json['total_basecost_per_Hour'],
    markup_per_Month = json['markup_per_Month'],
    markup_per_Hour = json['markup_per_Hour'],
    recommended_billrate_per_Month = json['recommended_billrate_per_Month'],
    recommended_billrate_per_Hour = json['recommended_billrate_per_Hour'],
    operation_cost_per_Hour = json['operation_cost_per_Hour'] 
    dollars = ( id,employee_Id, ctc_per_Annum,  ctc_per_Month, ctc_per_Hour, total_basecost_per_Month, total_basecost_per_Hour, markup_per_Month, markup_per_Hour, recommended_billrate_per_Month, recommended_billrate_per_Hour,operation_cost_per_Hour )
    stmt=desired_billrate_usd.insert().values(dollars)
    conn.execute(stmt)
    response = jsonify("success",id,employee_Id, ctc_per_Annum,ctc_per_Month,ctc_per_Hour, total_basecost_per_Month,total_basecost_per_Hour,markup_per_Month,markup_per_Hour,recommended_billrate_per_Month,recommended_billrate_per_Hour,operation_cost_per_Hour)
    response.status_code = 200
    return response  

@app.route('/getadmin', methods=['GET'])
@cross_origin(origin='localhost', headers=['Content-Type'])
def getAdmin():
    stmt = admin.select()
    res = conn.execute(stmt).fetchall()
    response = []
    for row in res:
        d = dict(row)
        response.append(d)
    return jsonify(response)

@app.put('/putadmin/<int:id>')
@cross_origin(origin='localhost',headers=['Content- Type'])
def putAdmin(id):
    # Get the request data
    data = request.json
    # Extract the values from the request data
    username = data.get('username')
    password = data.get('password')
    c_password = data.get('c_password')
    email = data.get('email')
    role = data.get('role')
    roleStatus = data.get('roleStatus')
    createDateTime = data.get('createDateTime')
    approvedDateTime = data.get('approvedDateTime')
    # Create the update dictionary
    update_data = {
        'username': username,
        'password': password,
        'c_password': c_password,
        'email': email,
        'role': role,
        'roleStatus': roleStatus,
        'createDateTime': createDateTime,
        'approvedDateTime': approvedDateTime
    }
    # Update the record with the given ID
    stmt = admin.update().where(admin.c.id == id).values(**update_data)
    conn.execute(stmt)
    # Return the response
    response = make_response({'message': f'Successfully updated admin with id={id}'}, 200)
    response.headers['Content-Type'] = 'application/json'
    return response

@app.post('/postadmin')
@cross_origin(origin='localhost',headers=['Content- Type'])
def postAdmin():
    json = request.json
    id = None
    username = json['username']
    password = json['password']
    c_password = json['c_password']
    email = json['email']
    role = json['role']
    roleStatus=json['roleStatus']
    createDateTime=json['createDateTime']
    approvedDateTime=json['approvedDateTime']
    adminval = (id,username,password,c_password,email,role,roleStatus,createDateTime,approvedDateTime)
    stmt = admin.insert().values(adminval)
    conn.execute(stmt)
    response = jsonify("success",id,username,password,c_password,email,role,roleStatus,createDateTime,approvedDateTime)
    response.status_code = 200
    return response

@app.route('/getCurrencyValues', methods=['GET'])
@cross_origin(origin='localhost', headers=['Content-Type'])
def getCurrencyValue():
    stmt = currency_values.select()
    res = conn.execute(stmt).fetchall()
    currency_values_list = []
    for r in res:
        currency_value = {
            'id': r.id,
            'ConversionType': r.ConversionType,
            'ConversionValue': r.ConversionValue
        }
        currency_values_list.append(currency_value)
    response = jsonify(currency_values_list)
    response.status_code = 200
    return response

@app.put('/putCurrencyValues/<int:id>')
@cross_origin(origin='localhost',headers=['Content- Type'])
def putCurrencyValue(id):
    # Get the request data
    data = request.json
    # Extract the values from the request data
    ConversionType  = data.get('ConversionType')
    ConversionValue = data.get('ConversionValue')
    # Create the update dictionary
    update_data = {
        'ConversionType': ConversionType,
        'ConversionValue': ConversionValue
    }
    # Update the record with the given ID
    stmt = currency_values.update().where(currency_values.c.id == id).values(**update_data)
    conn.execute(stmt)
    # Return the response
    response = make_response({'message': f'Successfully updated data with id={id}'}, 200)
    response.headers['Content-Type'] = 'application/json'
    return response

@app.route('/getOperationCost', methods=['GET'])
@cross_origin(origin='localhost', headers=['Content-Type'])
def getOperationCost():
    stmt = operation_cost.select()
    res = conn.execute(stmt).fetchall()
    operation_cost_list = []
    for r in res:
        operation_cost_value = {
            'id': r.id,
            'CurrencyType': r.CurrencyType,
            'OperationCost_Value': r.OperationCost_Value
        }
        operation_cost_list.append(operation_cost_value)
    response = jsonify(operation_cost_list)
    response.status_code = 200
    return response

@app.put('/putOperationCost/<int:id>')
@cross_origin(origin='localhost',headers=['Content- Type'])
def putOperationCost(id):
    # Get the request data
    data = request.json
    # Extract the values from the request data
    CurrencyType  = data.get('CurrencyType')
    OperationCost_Value = data.get('OperationCost_Value')
    # Create the update dictionary
    update_data = {
        'CurrencyType': CurrencyType,
        'OperationCost_Value': OperationCost_Value
    }
    # Update the record with the given ID
    stmt = operation_cost.update().where(operation_cost.c.id == id).values(**update_data)
    conn.execute(stmt)
    # Return the response
    response = make_response({'message': f'Successfully updated data with id={id}'}, 200)
    response.headers['Content-Type'] = 'application/json'
    return response

if __name__ == "__main__":
    app.run(debug=True)
    app.run(host='0.0.0.0', port=8000)