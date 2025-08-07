

export default function Aplication() {

    return(

    <div>
      <div className="Header" style={{

        border: '1px solid #e0e0e0',
        borderRadius: 10,
        padding: '0.3rem',
        display: 'flex',
        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
        justifyContent: 'space-between',
        marginBottom: '4rem',
        
        


                 }}>

        <img
          className="bounce-in"
          src="https://png.pngtree.com/png-clipart/20240921/original/pngtree-a-beautiful-logo-for-letter-n-png-image_16054834.png"
          alt="Nengovhela Logo"
          style={{
            width: 64,
            height: 64,
            objectFit: 'contain',
            marginBottom: '0.2rem',
            borderRadius: 10,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
            background: '#fff',
            padding: 1,
           
          }}
        />


        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            
            target="_blank"
            rel="noopener noreferrer"
            style={{
                                  background: '#1976d2',
                                   color: '#fff',
                                   border: 'none',
                                   borderRadius: 6,
                                   fontWeight: 600,
                                   padding: '0.5rem 1rem',
                                   cursor: 'pointer',
                                   boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
                   }}
                   onClick={() => alert('Prospectus is coming soon!')}
                   >
                         Prospectus
                           </button>
                   

                   <button
                           style={{
                                   background: '#1976d2',
                                   color: '#fff',
                                   border: 'none',
                                   borderRadius: 6,
                                   fontWeight: 600,
                                   padding: '0.5rem 1rem',
                                   cursor: 'pointer',
                                   boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
                                     }}
                                     onClick={() => alert('Academic Helper Dashboard coming soon!')}
                                          >
                        Academic Helper 
                      </button>
           </div>

       

          

      </div>

      <div className="container">

        <div className="card1">

          <img clasName="img1"src="https://www.univen.ac.za/docs/univen-logo.png" alt="Univen Logo" />
          <p className="description1">Apply to the University of Venda</p>
          <button className="button1" onClick={() => window.open('https://www.univen.ac.za/students/student-support-services/how-to-apply/', )}>
          
            Apply Now
          
          </button>
         

        </div>

        <div className="card2">

          <img clasName="img2"src="https://edurank.org/assets/img/uni-logos/university-of-limpopo-logo.png" alt="University of Limpopo" />
          <p className="description2">Apply to the University of Limpopo
          </p>
          <button className="button2" onClick={() => window.open('https://www.ul.ac.za/tgsl/tgsl-programmes/', )}>
          
            Apply Now
          
          </button>
         

        </div>   

        <div className="card3">

          <img clasName="img3"src="https://public.flourish.studio/uploads/70accd09-8527-4e3a-8c5c-af8fed4825d2.png" alt="University of Johannesburg" />
          <p className="description3">Apply to the University of Johannesburg
          </p>
          <button className="button3" onClick={() => window.open('https://www.uj.ac.za/admission-aid/undergraduate/', )}>
          
            Apply Now
          
          </button>
         

        </div> 

        <div className="card4">

          <img clasName="img4"src="https://th.bing.com/th/id/OIP.QF-zHDVgl2X_DmzSc_nc5wAAAA?r=0&rs=1&pid=ImgDetMain&cb=idpwebpc2" alt="University of Witswatersrand" />
          <p className="description4">Apply to the University of Witswatersrand
          </p>
          <button className="button4" onClick={() => window.open('https://www.wits.ac.za/undergraduate/apply-to-wits/', )}>
          
            Apply Now
          
          </button>
         

        </div> 


        <div className="card5">

          <img clasName="img5"src="https://wikisouthafrica.co.za/wp-content/uploads/2020/08/Tshwane-University-of-Technology-1024x986.png" alt="Tshwane University of Technology" />
          <p className="description5">Apply to Tshwane University of Technology
          </p>
          <button className="button5" onClick={() => window.open('https://www.tut.ac.za/', )}>
          
            Apply Now
          
         </button>
         

        </div> 


         <div className="card6">

          <img clasName="img6"src="https://www.freelogovectors.net/wp-content/uploads/2021/04/university-of-cape-town-logo-freelogovectors.net_.png" alt="University of CapeTown" />
          <p className="description6">Apply to University of CapeTown
          </p>
          <button className="button6" onClick={() => window.open('https://uct.ac.za/students/applications-apply-undergraduate-qualifications/application-procedure', )}>
          
            Apply Now
          
          </button>
         

        </div> 


      </div>

      <style>{`
                     @keyframes bounceIn {
                     0% { transform: scale(0.8); opacity: 0.7; }
                     60% { transform: scale(1.05); opacity: 1; }
                      80% { transform: scale(0.97); }
                     100% { transform: scale(1); }
                     }
                     .bounce-in {
                     animation: bounceIn 1.2s infinite alternate;
                     }
                  `
                  }
      </style>

    </div>

         

    );

}