clear
cd ~/assemblymade/meta
vagrant halt
vagrant destroy -f
vagrant box remove meta
cd vagrant/meta-box
rm -rf output-virtualbox-iso
rm -rf packer_virtualbox-iso_virtualbox.box
rm -rf packer_cache
packer validate template.json
packer build template.json
vagrant box add meta ./packer_virtualbox-iso_virtualbox.box
cd ~/assemblymade/meta
vagrant up
