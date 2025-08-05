import jsPDF from 'jspdf';
import { CLEARANCE_DEPARTMENTS } from '../types/departments';
import QRCode from 'qrcode';

const woldiaLogoBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUSExIWEhMVFxgZGBUWFRYYFRcYGhcXFxcWGBcYHCghHhslHRUXITEhJSorMC4uGB8zODMtNygtLysBCgoKDg0OGxAQGzcmICYwLzYrLi0vLy8yKy01Ly0wLisuLy0tLS0tLTAvLS0tLS0tLS0tLTUtLy0tLS0tLS01Lf/AABEIALcBEwMBEQACEQEDEQH/xAAbAAEAAQUBAAAAAAAAAAAAAAAABgECAwQFB//EAEkQAAIBAgQBBwcIBgoBBQAAAAECAAMRBBIhMQUGEyJBUWFxFVSBkZOh0QcUIzJCUnKxFjRTYnOyFzNDRIKSosHC0iSz0+Hi8P/EABsBAQACAwEBAAAAAAAAAAAAAAAEBQEDBgIH/8QAOBEAAgECAgYIBgICAwADAAAAAAECAxEEMQUSIUFRkRMUUmFxgaHwIjKxwdHhNPEVQgYjJDNDcv/aAAwDAQACEQMRAD8A9xgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIBqYnilCn9etTT8TqD6rzZGjUl8sW/I1Tr0ofNJLzNCpyqwY3xCejMfyE3LBYh/6M0PSGGX+6Ccq8Gf7wvpDD8xDwOIX+jMLSOGf+6N3DcXoVPqVqbdwdb+q81SoVI/NFryN8MRSn8sk/M3LzUbisAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBANLifFqOHXNVqBOwbsfBRqZtpUKlV2grmmtiKdFXqOxC+Jcv3Y5MNS3NgzjMxPci9fpMtqWiVFa1aXL8lLW0zKT1aEef4I/xXFYt6a1alYvTdivRqAoGUkFSqHKDdWHoMmYZYbWcaa2ru+72kDGdcUVKs3Z9/wBlsOIJPK063A8EtRK7kZ3pICqa6s2axIXUgZdgRIWLryhKEE7XzfAscDhoVISqSV7ZLiV4hSpph6Stzfzq7GpzZ0C3bKGAJAaxTTfea8JOpOpJ3vHd75m3SFOjCnFKNpb1wXeU5PYBKrVecuVp081lPSJvpYdeitp3ibMZiJUtVRzb38PbNWAwsKynKeSW4w4biWJoGy1KlMj7JJt6UbT3TbKhRrK7Sff+yPHEYig7Jtd36JVwPlzXJCVKPPaE3piz2AuTl2PotKzE6MpxWtGVvHIt8JperN6so63hny3+hMeE8boYgXpVAx61OjjxU6+naVVbD1KLtNFzQxVKurwf55HRmkkCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAUJgEJ5TcuAl6eGszbGqdVX8I+0e/bxlthNGOfx1di4b3+PqUmN0sofBR2vjuXhx+niQLEValRmdyzt9pjcka21PULm0vYRhBKMdi3HPTlUqNyldvebXJzFpTxNIvorZkDHZWZSFPpOnpkbHpui9Um6KUem28NhfxRHoIMHlyojlw3XUJJ6Q6gup6Oveb6DxhIxqSdfe93D9nvHzlTisPw38TlSwKk63JXE06eJbnXRKdSi6tzjKEaxUgHNpsX07zK3SUG6acVtTLvQ89sovI0MPiQKJotRUuHutdQiXX7pRFA7dR3endTo1I1NbWvG2TI+JxFCpT+W0r7jd4BwWnXq85WUGlQs7FttLlV9xJ7ge2eMfU1YaqV3LYjOi4yc3K9ox2sx8ZxzV6rVWBAP1QepRt8fEmbsNSjShqLPf4kbGVZVqmu1s3eBtJgvm9EYl6lVKjgilTpOKbMDY3dypsugOg006yJExE3iJ9FBJ2zb3e/wA8CxwkI4Wn01V2vkt9iykTQSnWqo5avTZqTBrVaNRT9tkKh1IZSGtm1sb7zXR6SpJ009ie1Zpruve2WV7cDfi1Qpx6a1pNbLbHfytxzJPyb5c6inivAVQP5wPzH/zNWL0Xb4qPL8fgxgtL3tCvz/P5J6jAgEG4OoI2MpWrF+nfaisGRAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAKM1tTAPM+WXK01SaNA2pbMw3qdoH7n5+E6HR+j9T/sqZ7lw/f0Oa0jpHpL06T2b3x/X1OLwHDNU57mWC4mmivRuFOubpaNpsuW/VnvpvN2PqKOrF/K73t78zXoyipa096yN7jHE8Q2JqJQuquqq1PmgWZhcFwSM2xy3PUoOkj4fDU+ijUqSy79i99xvxWLmqkqVKG1921++84FGjTaotOvdKbNlY6ArobE5ttbbyxrTkqTlDa93tFZg4J10pO1r39s2OIYtnIXnGqU6fRpFt8g0DNfUsQAST19gsB4w1BU43tZvP8eC3GcdinWnbcsvz4s0mYDcgeMk3SISi3kWlkO5U27xPLnHibFTq7ovky4OO0esR0keJh0ameq+TLXRgcyVKlJiLXRytx2EDcd08VKUKmySN1DFVKOyORuYjiteotLnglU0QAFF0DqLXz6kZiBYkAdWk1UsMqUZajz3kitjI16kHJbEdnD4hcbig1YrSRFvzZYfVW11G19TckDb0SNNPCUNWO2T39/vL+yTB9dxGtLZGO736mLFtUx+IOQdEaLfRVS/1m7Cd7ejqmymoYOl8Wf1fA01ekx1a0Ml6LizT4zSwmH6BxDtUX6xWizU1PYzLt4DMR2TFPF1p/F0fw+P5zNs9G0l8KqfF75Hd5O8fq4JxQrg812HVqd/tL2qez1dh0YnDU8VHpKXzfXu8fbPeFxVXByVOt8vqu/w9rI9LpVAwDKQykAgg3BB2IMoWmnZnSRkpK6L5gyIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAQD5QuUJ1wtM/xWB9VP8A3Pq7ZdaLwd/+6fl+fxzKHS2Nsuhh5/j8kFWg5FwrEdoBt65dOpFO1yhVObV0nyNeqLEVA7UmTUVFJDL27akd3XPNWEZxakrm7CVp06i1Xmd/jvFa4qIKeMZhSUAuioA7W6ZYWKt4bDsuLyuwuChOGtOOf0LTGaQlSqatPbbPxM3DeBPVPOVy2uupJdu8k7fn4TRjNK06C6Khta5L8+8zfgdDVMRLpsS7J7t7/C97DT5RYIUqtlFlZQQPcR7r+mStF4p16OtJ3ae0gaYwkcPibRVotXX0ZIuSNnw1E02QEoc5CgksG6WYgjUXG8qcT/8ANK/Fl9Q2UopZWR2/m9T9r/o/+00Gy5gFANdGckWIILMc3TdTcZrbKIsZuc3juHp08PWFk2TKcovdnta/+GSMKr1o+JGxjtQn4Mi/A8PzlempFxcs19rKL2I7CbD0y40nXdHDOUXZ5L34XKPQ+FWIxSUldK7fvxOvxjksrdOkBca5D/xJ28JVYLTL2Qr8/wAr7+hdY/QWxzwuzjHc/D9nJwHGHoiphrGm1VlCVdiG0U02+6TrZurMdtxaYilGc41Xtil7ff3lVhZSjSlShsn37PLu/JqcU4ZUpXpuuRiumx0OlwRJdKtCrG8XdFfOnUoVF0i25mTiHEatch6rBmCgaCw7yB3nUzGHoQorViMViZV56zJRyB5Rmmww1Q/RsegT9lj9nwP5+MrtJYNSXSwz3964+X0LPRWOcGqM8nl3Ph5/U9KlAdIIAgCAIAgCAIAgCAIAgCAIAgCAIAgHK5TcXGFoNV3b6qDtc7egak9wkjC0HXqKG7f4EbF4hUKTm/LxPGhjaqPzyZWqhi30gLKSb3JAIJNzffedXUoqVPo1sXccnQxGpW6Se38slOJxmOqPQfDVkWnVoK4V6a83msM12tnGrKLA9Y75RQpUVCTqXunbZ78ToZ1avSqMFsavf35HK4jxU1VelWwiU64bKXUg3sdQBa+4tud5Pw1CUGpqd4WuVmMxFOacFH4729vM63BOBBAKlUDNuF6l7z3/AJSo0jpZ1G6VF7N74/r6+GdzovQ6pJVa6vLcuH7+nia2K5Tnn6SUU5ykXCu1iWYNpdAOoEg367dms0LRM1h5Vqjts2L8/gmf5elLEqhTV+L/AAbvKrCZqQcb0zr+E2B94HvnvQeIUKzpv/b6r2yN/wAhwvSUFVWcfo8/Wxh5F074YU6qZQlWqFADFullqByBsLMQOrQds341p15Wd/djXhdboY3W462HCZTd1Vhey2pAnS9rMmbu9EikgVLCmMwN7HKQTp0jc2Zh26X7BANXjyh8My0hmLNTFgS3SUmo9rk/ZXbvkjCTjGtGUnZfqxFxsJToSjFXfDzNPkfgiM9UixPQXwBux9YA/wAJmNO4lSlGlHdtfnl6fU9f8dwrhTlVlv2LwX7+hr4rlRUw+Kdayf8Aj3ABA6dPT6xt9ZTv3C1uyaY6J6TDRq03eW/8eKy8SX/llHEyo1FZL3fweZ0eO8ITFU89MjMVBV1OjDcaj3Ga9H6QlhpdHU+XeuHvevue9IaPjiUqtL51k+Pc/s/sRvB1Kb17Yusy3BJYjpMUAGQkDQ2B6tbW3M6eo3SoroI34ee85KnDrFaTru1s93l3HTpl8SwTCYKgtAMA1SsrFyt+l0lYENbqBY7bSDU6SktepU+Lcl993pYsaSoVXqU6V48cuW/7nM47XRq7c2qoinKuTZgpIDeJFtvfvLHCQkqS13dvbt3X3FRjpwdZ6isls2d289M5E8a+c0BmN6tOyv3/AHW9IHrBnPY/DdBV2ZPL8eR0mjsV09Lb8yz+z8yQyEWAgCAIAgCAIAgCAIAgCAIAgCAIAgHlPyh8U53E80D0KPR8XOrH0aD0GdJomgoUtd5v6HL6Yr69Xo1lH6nGo8GrsgqLSYqdQR194G8mSxVKMtVy2+/IgxwdeUddR2FvDseKaNhMTRNfCs1wBpUpNfMRuOjm13BGu+0iV8I5z6Wi9vp7+pZ4bHwUHCtuO5yaw+dnxLi5LHL3Em7N77euVmmMS6cY4aHDb9l77ix0HhFNyxVRbW3b7v7LzNTlNxUuxoqbING/eP3fwj3mbtE6OjGKr1FteS4d/j9PE0aZ0q3J0KTslm/t4cfd8vJDmSWOdTWBIyXGZR2hd9e3ut2zTp2vVuqdrRz8X+ve4k/8fwtNQ6Z/M/Rfv3vJTOcTZ0tuJrVDdm0VrBCcy5l0FW9++zaCTsJ8rK/GNayMtNzsKNrfdbm+v7i3PrsJKIZaruMtjk1ICqKYvmKuNXNhfNoALjW94BcCWdcxBIuRYnrRAptprZ3G0j4mTULcSThIp1LmyTK4tCM8rHw7rbnENZbDICC2UnUMBsNyL986DQkq6m42+B59z97P6Oa/5BGg6aqXtNZcWuHln/ZHeT3FmwdQU2N8LUa2v9kxP1h+6TuPTvvL0ro5VIurD5l6+/fdH0PpR36Kpl79s7nLHh39slgTo3YGt0W/2PomvQeL1o9BJ7Vl4cPf2M6ewShJYiK2PZL7P7cjT4pxg16FG1YC6fSUKSlKasLqQTuRcHoHS1j2EzsJhrVJOccnsb9+pBx+KtTjGnK11tS97PA49paXKOx3eRXE+YxSEmyVOg3ZqdD6Db0XkLSNDpaLtmtq9+BYaMxHRV1fJ7GewCcqdgIAgCAIAgCAIAgCAIAgCAIAgCAa3EsWKVKpVOyKzeNhe09Qg5yUVvPM5KMXJ7jwnEVj0nY3JuxPadyZ2kIqMUlkjhpN1Kl3m2SBqKNUK4filSjWp2p81VdlW9MBLKj2Ujo3sAd7yijNat6tO6e267/fFHTuE07U5rZufv7M0uPtUDgV8nPKgFRkFlY3Yq22+QpfwllgUuj+HK7tfy+9yl0ltrJPOyvb3wJZwnD83RpqdCFBP4j0m95M43FVenxEp8Xs8N3odxhqPQYeMOC9d/qQ7h9Dnqyqb2djcjq0LHX0TssXXWGoOS3ZHC4HDPGYjVeTu2zLxTkopfKChB2csqlfxC+p/PukGlpajUpOVRbeFr38P3kWk9E4mhWUaUvhe97vH9Zkw4dTKUkplnqlFC85kY5rC1yQCPefTOYqQlOblGNr7uB1UKkIQScr2LjXKJzbU2ta5ZEqsD0tSbU7BiNTcyfBaqSKyb1pNmxhOLU6huGACg5iSAATl0JOx0Ohnq55aNYsUCkbHYM66k3vlLG7aGwtfQA36ouCmjFG5l86sNWosCAKWSwLDYsSdPuzXWTlBpG2i1GacsjJimzKyFay5gRdaVUkXFrgqpt4yHClOE1JxvbdxJ061OcHHWtffwIjhOT6q+RqlOlTHeqs3ghsQfEeudNU0xTjSUoxetw4eP69Dk6ehatSu1Un8PG+f48/U0uUeBVecRDmTL0TcH7N7XHWCD6pKwOK6xRUpfNvRDxuE6pirQvq7LP9k1FLnsOAdecpqb95UEH12M5CjVeHxCktz9N/odviKKxGHdN71/XqQnBYNqtQUkAztewJA2BJ37gfVO6qVY04a8sj51Sozqz1Irb3nep8ExC0xQxOKoLRGtPOfpFa+gzG11sWFr9Y7JTvF0o1ekpp7c/e06GWEnVodHUsrWtb2txw+I0KSkc1XXEKVvnTa9yCBYkdmt5bYerKpG8o2KPFYeNCeqpXPYeT2O57DUqu5ZBf8Q0b3gzlcTT6KrKHB+m463C1eloxnxXrvOjNJIEAQBAEAQBAEAQBAEAQBAEAQCM/KJicmCcftGRPfmPuUybo6GtiI920g6SnqYaT8uZ5I6XBB2II9c6w4+MrO50KfFMNVVaeOwzmoqhfnFJcwcAAAsBqGsB1H0bSplRxFF/9W2PDh78S/jWw1da0naXjb372llVab1Ep0g3NXp01z/Wy9FST7zNz1qOFlKWdm/NkSGriMdBR2q65IlnHeLigoAXnK1Q5adIfWdjoPR3zj8LRdSWvklm/t3v+ztcVWjCOrm3kvu+C95jk/wALNGkFrvTq1zcu1qSohP8AZ0wF2HWxBJI8AtlOpKbvJ3KqFOFNWgrI7aNbQaD93Uf6V/3ng9FvPD74/wBX/aYBVWB2YegOPWQ0AtqUQxUkXINlYG5X8NQWYd99DtBkjnJfid2qc7VOeoykFj0ycoUqu1h0VYLoOnoJohU+JxlmRcJUqTUozW2P0f4yJFlB8e4/8Ta03koZLdR9JAH52gXKrVbbOx7lJMGTX4nw/n6bUmLU2a+SrkUlGOwIa4YHsO+29jMxk4u6fvyPMoqSs1dHK5NcROuDroKWKw6qCgvkqUwAq1qRO6EAd4OhldiKbUtbiWuHqqUdXgR/iCU0xf0pdaYqVLmmCWs1Op0RbUXzBb9862DlVwUXFXdl6W/BxtlRx9RN2V36/wBmjg6eHpVxUGH51AxZQcqtcXNMuddja9r+BkirRnOjqKyey/3saKOKUKzlKTaV7d5RyLmwsOodg6hJUU0tpWzknJtHpnyZYjNhnQ/YqG3gwB/PNOd0tC1ZS4o6fQ09ag48GTCVZbiAIAgCAIAgCAIAgCAIAgCAIBCPlTqfQ0V7ahPqQj/lLTRC/wC9+H3RUaZf/nXj+TzedKcsIsZK08aKLpVILBWvYbk5WygeLZdtZC0hBTw8ot2y2+ZZaJnqYlSte1/p+8yY8nOEVVY4rEC+KqDbQjDodkAv9cjex027c3OyasoxVor3d9/E6Ta25Sd28/wu5e9pv4fiHW9qdPIrq3O/ZYnLnDE5Tax6+vXTXxc9WM4xNIm2ZCbkAdZIOU2sovrp166TI2mariUSwaplJ2B5wE+HSmAW88jEDMpJvYFhnNmymy1AT9aw8SIBbhK4d9NQGyk9pCEkDU5gLjUEi99Ba8A82RP6ttVJ6yzHqvmsddrHq1FxexvQVZy15bb2fv35FnTpwXxKO1pX7yfcF4mWo5ql2ZWCnKHuScuUZRfXpW9F9JbYWt0tPWefvy5bCFXp6k7I3qeOQrnJKCzXDJUzLlYowNjuGBGm9tLySabGYOGuAc1jY/1lrgkEEW7QR6IBjzU8pa6BRe5JAXS4a5ZLaWN9dLGAc7j/AAcYlVy1BTxVElsPXBBIa1yj2Gqkbi2o111Ew0mrM9Rbi7ohOMxT1KjmqnNVhYVaf3XCgG37ptcHXQ7mdDoxxVBRTyv9WcxpeMusym1sdrckjBLEqhAJ98lb6117qZ/nEo9Mx+R+P2Oh0G/nXh9z0CUZ0AgCAIAgCAIAgCAIAgCAcvlDxlcLSFVkLgsFspF9QTfXwm/DYeVeepF2I2KxMcPDXkiN/wBJFL9hU9a/GWH+Hq9pepX/AOapdl+hX+kej+wqetfjH+Hq9peo/wA1S7L9CO8seUqYxaQRGTIWJzW1uANLHuk3AYCeHm5SayIOP0jDEU1GKeZGJbFOW1HCgsxsBuZ5lNRV5ZHqEJTkoxV2ySck+CG64uuArb0KT6ZAf7Z/3z1DqHedObxmKdeXduOqweEjQhbe839vD6kvCjsU9+UvfvuLSGSy2rhgyhStlDBrKqqLg3GjHtgzcomHprsirvsKK7kEnTtIB8QOyYF2XtTVjcrmO17Um/PXrgGM4Ol10qdtR0qQUa2vdrW1yjq1sIBkw9BEIyIKYJv0QMhshAOmmwA6jMmGefcRwfMlUK2XKpQlAFYAK+h2ZluNNDcHa4JpcXRlCblu4+/XuLGhNSjbeSDkjQvTqXJyB0Kupy3ZSzXBYbAMovc3ufAS8AnqNs04prWSO22ApMxZsj6KAGNM2yMzAjokhruTe99pOIxmoUEQkqqITuRYE3YtvkF9WJ9JmAzUXhVG9tSoUKqioNLX683VewAtYei2Rc3aWGC5rBhnbMSQWOawFxlO/RGvdBi5xeU3AvnIz07Li6a6EgqtZPuNfvOn3Sew3m2jXlRlrR/s016EK0NWX9EGpVM19CrAkMp0ZWG6sOoidNQrRqw1onJ4nDzoz1Zf2XzcRyS8iuO0sK1RqoazhQMoB2JJvcjtlbpDC1K6iobrlrozGU8O5a++2RLP6QML2Vf8i/8AaVf+JxHcW3+Zw/fyKf0gYXsq/wCRf+0z/icR3c/0P8zh+/kd/g3FExNMVaeYKSR0gAdDY7GQa9GVGepLMn4evGvDXjkb01G8QBAEAQBAEAQBAIl8pn6oP4q/k0stE/yPJlVpj+P5o8snUHKiDIgwCQASTYDW8w2krszGLk7I1eF8awQq85i6v0dM3p0ArM1Rhs7gCwUdSk69em/PY3Fuq9WPyr17zqMDgugjrPbJ+nd+fQkWI+VTBC7Iajm+1lVvDVSPfaQCw1WYafyn4dvtCn3MKr+vKQvqhK5jVM1Ll9hW/vAU9q0AP51aZUXuQM7ctsKuvz6r/ho0j7hQmeim93oY1oofpthTY/PqpvpY4ZL+/DTPQ1Oy+RjXhfMrV5aYdNsXfxw1VvXzCpb0w6NRbdV8mFOHH1Qo/KPgwQzVAw7UVwzGxGqOiADW+7Gaj20a2K5a8Pq0wjt0QF1ZWLBlUDMFpqTuOthfYqReYnBTVmjMW4u6Zs4bltg1UBa7IANObwtTxuS9NtddTPcMNJRSjHYeJVYt7Xt8UZf07wp0+dVT44eqo9YpAT10VTsvkzGvDiuf7LanLnDDbEVD4JU/5LHRT4P1/A14cSxuXtHzmpbs5of+yfzmOjnwM60eJrV/lEpKDkemzdXOUa6j/NTp6eNjGpLejKaeRbhPlRo3Aq000NwyVcTv3CpQUes9c82e8zY5fKblPgsQ4r0M9PEAAOrJ9HXUbAspNnHUxA7D1Tfh68qM7rLeRsThY14asvJ8DHh66uoZTcH1juPfOlpVI1I60Tk61GVKTjIyzYahAEA9X+Tr9SX8b/zTl9KfyX4L6HXaJ/jLzJPK8shAEAQBAEAQBAEAiXymfqg/ir+TSz0T/I8n9iq0x/H80eWATpzlS8UGvbKb9ljf1Tzrxzue+jle1tpTmza9jbt6pnWV7HnVdrlww7Fc2Ule2xt69p5lON9Vs9xhO2sk7cS1KXYu2ug6u2PhQTm8igHVM7FtPN29hkegw1KkeIInlVIvJmXCcc0Wc2bXsbdttPXPWttsYs7XKqhNyASBvpt4w5JbLhKTV0i20yeblwQ2vY22v1eE8uW2xlRedihw9rdC19ujv4TylE9uU+/1Aw+tsuvZbWPhtcXqXttAQ20Gg9U9XSPD1ntKlCNwRM3MNNbivNNe1jfssbzGurXuZ1JXtYo1MjcEeImFJPIOMlmi5qDjUqwHeDMa8dzMunNbWnyLUQk2AJPYNTMtpK7MRi5OyQemb2I17CNYVmrmW5p2ZUUTe2U3HVbX1TGtFK5lxm3azuGpMNwR4iZU4vJnlwks0UKnrFplNMw01mUImUYPV/k6/Ul/G/8ANOX0p/Jfgvoddon+MvMk8ryyEAQBAEAQBAEAQCJfKZ+qD+Kv5NLPRP8AI8n9iq0x/H80eU1VJUgGxsbEbg9RnTPI5mnLVmmTZseEC48jSumFXU7c4450n8K2PonNNScehX+rl7+vM6pRiqjqP/ay+v65HP5QIKFJKTnKrV6lRtbAJnyKSfwkGTcNN1JSqrNRSXjbb6or8TSjFQovfJt+Htl3F8ViaeORKTstNXpKKAA5tqZKhujbvbXqtNcKFOeGdR/Nt295u6zOGJVC3w7uRfhUVcXjUTRfm9bQbDWncegkibJylKlRcuK/RppwjGddR4fYjmH/AKynb9pT/wDUWWVb/wCKXg/oVODV68PElCYqseJPRaoamHbOGpMFKqObBBBtcai2/wBqUrpRjho1Y7Jf2dBDEOpXnRktlvf1OXgj/wCHiRe4FZLeFkk+f8uD7vyVqX/hlbj90djk/hXSlSHNh0xDMaxLAFaWRlSwJ1u1j4MZBxtbWrNp/Ll432++4scDQUaCTXzZ+/Ai+Owxp1GpndSR49h9IsfTLqjUU4KS3nOVqTp1HB7mb2AJOBxHdiE9H0dP4yHU/mR//P5LJL/wPx+5mxrnmuHG+uWl76lOaqf/AN/n9yRVS6Sgve47tFEqYtqlPovQapTrJfXpITTqDuO3u+zK/pJRo9HLJ7V9/f5J7ox6XpVnaz+xHMBrgcUL71KQ9y/GW1X+ZDwf3KinswMn3/dHR4VT+dJhK7G5ok06576PSUn8Vhf8chzm6HSUlvy88/TLwJ7pKvKnW4Z/b1MXB8eXr4usXamDh6jZwMzIMy2YL1lQBp12nvF0ujp0qee3m/2asDV6SdWo/aONx3iPOUGy42pirBj06BpZDl0I0F9zJODo6jbcNXzuacZUU5wjr623KxM8TXJxpC4t70qYdsGtMHOmUi6sxF9SCbbadspoqPRpOOb+a+wuHrJt33ZW2/UjfCuJc22IcpVpUXA+noqGbDku1gQQdDcDQfZ26xaYynJqEL3a3P8A27/fEqtHSh/2Tta75IcdqOaeHrGuuJQ6JWFM06jAOtxUBJuRqL2HXpPGE1dSpFJp71mst3vge8ZFutSlmr5lnLPF1qOKxFWjWak4W11ym4yI1iGB61E24ajCrhYqXf8AVmqpXdHGtRWdvojd5bYmocRVpGq3M9G1Po5VOUag2vfUneedHUYdGqltu08aTxM9fo9ysxydxy1KGeuC9bh4UBv2qNfmCxPWCpF/3b9c01KU6dV0YbFP04+n4JfSUqtNYiWcff1y4HCxeIao7O5uzG5P/wC6pcUoKEVGOSOfq1JVJucs2ep/Jz+pL+N/5pzWlP5L8F9DqtE/xl5knlcWQgCAIAgCAIAgCARP5S/1QfxV/JpZaJf/AKPJ/YqtMfxvNHlc6g5YPWqNR+btULUhfIuVRlvm+0Bc2zHcyPHDQjNzWbJs8dOUYx7PqZcbiqlYfTvzpy5b5VXTXqUAde8UcPCjFqJ4r4udaam92RkwnGMWiimMUxRRZb06ZqBfu84Vvbv37CJoej6Llf0JT0rU1bJK/EwUsVWpvzlGsaTlSrNkpvmBIYgiopG6g33kirh4VYqMlsRHw2MlQbaV78S+vxDE1ABVxBqFWDIeaorlYEEGyIL7DQ3Gk108JTgmlvVjZU0hKcoyay2mduNYtgQ+JLKRYgUqSX8WVc3qIniGApQd7ZGauk6k4uKVrmqleoFdBUtTexKZV+sAAGzEZuoaAiSHRg5qo80rEZYlql0VtlzDxGlz5VqxD1FQItTKqlQpJUKFAAsSTPEMLTjFxSzN0tIVnPWvZcEbOIxVSoc1V+cewBbKi3ttogAnujRjSjqxyI+JrutPXaKYTF1qLs1GrkDgB0ZFdGtsSG2Ou4tNdfCwrO8s+KJGGx0qMdW10X4zG1apDvUzOuXK2VQFysGACiwtcTNPDQhBwWTzNcsZOVZVZbskVXH1hXOISpkqOLVCFUq400KnTq0PVPEsHSlBQe42w0jUjKUuPoWUcTUVXphhzTlSVyi+ZbWObfqGk2OjF1FU3o0dZfQ9DuuXYPGVaQqoj2p1vrrlB1tlJDdVxofATzPDQnUVR5o2Qxs40XSW8tw2Mq0mL0XVCy5WzIHBFwdj4RiMNGslfcMLjHQTVr3Lsfj61emadVkIN7ZKSpa4I6t95ihhY0pNpt+J7rY/pNX4UrO5biMZWaqmI522ITaoFUdVrFQLEEG1o6pS6LorbAtI1OldT0K0cfXSq1anVCvUFqgNNDTqak6paw1J2tv3mKmEpziovdk77TNLSEqbl8Ks3exXiOOq1wBUcEgWXKiqq7fVUeA3vM0sNCnFpb8+Jrq42dSopvdkjHxKs9fO1RszuLM2UD7IW+UabAT3SpRpw1I5GqeIc63StGbG416zmpUIZza5ACg2FthFGjGlDUjkecRXdao5sx4fEOnOqrDJWCB1ygk5CxUhur6xidCMqkajzR7hinGi6SWZim4jHrPydfqS/if+acvpT+S/BfQ63RP8Zef1JPK4shAEAQBAEAQBAEAxYjDJUFnRXG9mUML9tjPUZSi7xdjzOEZq0lc1vI2H83o+yT4T31ir23zZr6vS7C5Ip5Gw3m9H2SfCZ6xV7b5sdXpdlckV8jYfzej7JPhHWKvbfNjq9Lsrkih4LhvN6Psk+EdYrdt82OrUewuSLPIGF82o+zX4TPWq/bfNnnqlDsLkh+j+F82o+zT4R1mv23zY6pQ7C5Ifo/hfNqPs1+Edar9t82Op0OwuSHkDC+bUfZp8I6zX7b5sdUodhckPIGF82o+zX4R1qv23zY6pQ7C5IeQML5tR9mvwjrVftvmzHU6HYXJDyBhfNqPs1+Ex1mt23zY6nQ7C5IeQML5tR9mvwmes1u2+bM9UodhckPIGF82o+zX4R1mt23zY6pQ7C5IeQML5tS9mvwjrNftvmzHU6HYXJDyBhfNqPs1+EdZrdt82Op4fsLkh+j+F82o+zX4R1mt23zY6nh+wuSHkDC+bUfZr8I6zW7b5sdTodhckPIGF82o+zX4R1mt23zZnqlDsLkh5Awvm1H2a/COs1u2+bMdTodhckPIGF82o+zX4THWa3bfNjqeH7C5IvXguGH93o+yT4R1it23zZ7WGor/RckV8jYfzej7JPhMdYq9t82Or0ewuSHkbD+b0fZJ8I6xV7b5sdXo9hckPI2G83o+yT4TPWKvbfNjq9HsLkjZw+HRBlRVRexQAPUJqlJyd5O7NkYRirRVjLMHoQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEA/9k=';

// Function to generate QR code as a data URL
const generateQrCode = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, { errorCorrectionLevel: 'H', width: 100 });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return ''; // Return empty string on error
  }
};

export const generateClearanceCertificate = async (request: any, signatures: { [key: string]: string }) => {
  const doc = new jsPDF();
  let yPos = 20;
  const margin = 20; // 1 inch margin (approx 25.4mm, using 20 for simplicity)
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Set font
  doc.setFont('helvetica');

  // Function to add watermark
  const addWatermark = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(50);
    doc.text('Woldia University', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
    doc.setTextColor(0, 0, 0); // Reset text color
  };

  // Add watermark to the first page
  addWatermark(doc, pageWidth, pageHeight);

  // Certificate Border
  doc.setDrawColor(150, 150, 150); // Light gray
  doc.setLineWidth(0.5);
  doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);

  // HEADER SECTION
  doc.addImage(woldiaLogoBase64, 'JPEG', margin, yPos, 30, 30);
  yPos += 35; // Adjust yPos after adding logo

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Final Clearance Certificate', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Woldia University – Academic Staff Clearance', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Reference Code and Date Issued
  doc.setFontSize(10);
  doc.text(`Reference Code: ${request.referenceCode}`, pageWidth - margin, margin, { align: 'right' });
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, pageWidth - margin, margin + 5, { align: 'right' });
  yPos = Math.max(yPos, margin + 20); // Ensure yPos is below header elements

  // Teacher Info Box
  doc.setDrawColor(0);
  doc.setFillColor(240, 240, 240); // Light gray background
  doc.rect(margin, yPos, pageWidth - 2 * margin, 40, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Teacher Information:', margin + 5, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name           : ${request.initiatedBy.name}`, margin + 5, yPos + 17);
  doc.text(`Department     : ${request.initiatedBy.department || 'N/A'}`, margin + 5, yPos + 24);
  doc.text(`Staff ID       : ${request.initiatedBy.staffId || 'N/A'}`, margin + 5, yPos + 31);
  doc.text(`Clearance Type : ${request.purpose}`, pageWidth / 2 + 10, yPos + 17);
  doc.text(`Submitted On   : ${new Date(request.createdAt).toLocaleDateString()}`, pageWidth / 2 + 10, yPos + 24);
  doc.text(`Finalized On   : ${new Date(request.updatedAt).toLocaleDateString()}`, pageWidth / 2 + 10, yPos + 31);
  yPos += 50;

  // DEPARTMENT CLEARANCE STATUS TABLE
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Department Clearance Status:', margin, yPos);
  yPos += 10;

  // Table Headers
  const tableStartY = yPos;
  const colWidths = [10, 80, 30, 25, 25]; // Adjusted widths: #, Department, Status, Signed Date, Signature
  const colPositions = [
    margin, 
    margin + colWidths[0], 
    margin + colWidths[0] + colWidths[1], 
    margin + colWidths[0] + colWidths[1] + colWidths[2], 
    margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]
  ];
  const rowHeight = 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(220, 220, 220); // Header background
  doc.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, 'F');
  doc.text('#', colPositions[0] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
  doc.text('Department', colPositions[1] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
  doc.text('Status', colPositions[2] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
  doc.text('Signed Date', colPositions[3] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
  doc.text('Signature', colPositions[4] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
  yPos += rowHeight;

  doc.setFont('helvetica', 'normal');
  request.steps.forEach((step: any, index: number) => {
    if (yPos + rowHeight > pageHeight - margin) {
      doc.addPage();
      addWatermark(doc, pageWidth, pageHeight); // Add watermark to new page
      yPos = margin;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(220, 220, 220);
      doc.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, 'F');
      doc.text('#', colPositions[0] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      doc.text('Department', colPositions[1] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      doc.text('Status', colPositions[2] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      doc.text('Signed Date', colPositions[3] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      doc.text('Signature', colPositions[4] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      yPos += rowHeight;
      doc.setFont('helvetica', 'normal');
    }

    const isCleared = step.status === 'cleared';
    const rowColor = index % 2 === 0 ? 255 : 245; // Alternating row colors
    doc.setFillColor(rowColor, rowColor, rowColor);
    if (isCleared) {
      doc.setFillColor(230, 255, 230); // Light green for cleared
    } else {
      doc.setFillColor(255, 230, 230); // Light red for issues
    }
    doc.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, 'F');

    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}`, colPositions[0] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
    doc.text(step.department, colPositions[1] + 2, yPos + rowHeight / 2 + 1, { align: 'left', maxWidth: colWidths[1] - 4 });
    doc.text(isCleared ? 'Cleared' : 'Issue', colPositions[2] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
    doc.text(new Date(step.updatedAt).toLocaleDateString(), colPositions[3] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });

    const signatureKey = step.department.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (signatures[signatureKey] && signatures[signatureKey].startsWith('data:image')) {
      // Add signature image
      const imgData = signatures[signatureKey];
      const imgType = imgData.split(';')[0].split('/')[1].toUpperCase(); // Extract image type (PNG, JPEG)
      doc.addImage(imgData, imgType, colPositions[4] + 2, yPos + 1, 20, 6); // Adjust size and position as needed
    } else {
      doc.text('[Pending]', colPositions[4] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
    }
    yPos += rowHeight;
  });
  

  yPos += 23;

  

  // SECURITY/FOOTER SECTION
  if (yPos + 40 > pageHeight - margin) {
    doc.addPage();
    yPos = margin;
  }
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100); // Gray text

  // QR Code
  const qrCodeDataUrl = await generateQrCode(`https://your-university.edu/verify/${request.referenceCode}`);
  if (qrCodeDataUrl) {
    doc.addImage(qrCodeDataUrl, 'PNG', margin, pageHeight - margin - 60, 35, 35); // Adjusted position to be higher
    doc.text('Scan to Verify', margin + (35 / 2), pageHeight - margin - 25, { align: 'center' }); // Adjusted position to be below QR code
  }

  doc.text('Generated by Woldia University Teacher Clearance System', pageWidth / 2, pageHeight - margin - 10, { align: 'center' });
  doc.text('For IT Support: support@wldu.edu.et | Woldia University, Woldia, Ethiopia | +251-XXX-XXXX', pageWidth / 2, pageHeight - margin, { align: 'center' });

  return doc;
};

// Helper function to load image (conceptual, would need actual implementation for browser/node)
// async function loadImage(src: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = () => resolve(img.src);
//     img.onerror = reject;
//     img.src = src;
//   });
// }
