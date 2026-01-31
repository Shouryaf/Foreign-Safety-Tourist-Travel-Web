@echo off
echo Testing Python environment...
python -c "import sys; print('Python version:', sys.version)" > test_output.txt 2>&1
echo. >> test_output.txt
echo. >> test_output.txt
echo Testing web3 installation... >> test_output.txt
python -c "import web3; print('web3 version:', web3.__version__)" >> test_output.txt 2>&1
echo. >> test_output.txt
echo Test complete. Check test_output.txt for results.
type test_output.txt
pause
